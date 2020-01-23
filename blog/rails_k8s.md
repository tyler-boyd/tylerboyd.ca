# Ruby on Rails on Kubernetes (with CI/CD)

I recently moved all of my side projects over to a DigitalOcean
kubernetes cluster and figured I should share what I learned in
the process. Currently, I'm running 4 Rails apps in production
on this cluster, and at work I am using much larger clusters
for a wide variety of apps (Java, Node, Golang, etc.).

## Motivation

Why Kubernetes? There are a few benefits over VPS's that I've observed:

1. Running docker containers instead of native programs fixes dependency issues
    (ie. less "but it works on my machine")
2. Managed Kubernetes will handle health checks, load balancing, restarting failed containers, etc. without any manual sysadmin work. This is a big time-saver
3. The master/control plane tends to be free (at least on AKS, GCP, and DO), so there's no additional cost to use Kubernetes
4. It becomes trivial to manage deployments of simple apps (ie. keep using the old version until the new one passes a health check)
5. Easily scale &mdash; simply add more resources to your pod,
or add new nodes to the cluster if needed

As a result of all these benefits, the idea is you can
save time and money compared to physical servers or VPS's.

## Implementation

### Part 1 - Dockerizing the app

First thing's first, you're going to want to write a Dockerfile.
This will vary depending on the language you use, but for Rails
apps mine typically looks something like this:

```Dockerfile
FROM ruby:2.6-buster

ARG RAILS_MASTER_KEY
ENV DISABLE_SPRING=1 \
  RAILS_ENV=production \
  RAILS_SERVE_STATIC_FILES=1 \
  RAILS_LOG_TO_STDOUT=1 \
  RAILS_MASTER_KEY=$RAILS_MASTER_KEY

WORKDIR /app


# Install dependencies

RUN apt-get update && apt-get install -qqy [...] && rm -rf /var/lib/apt/lists/*
RUN gem install bundler

# Install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash && \
  ln -s /root/.yarn/bin/yarn /usr/local/bin/yarn

# Bundle install
COPY Gemfile Gemfile.lock ./
RUN bundle install --path vendor/bundle --without development test

# Yarn install
COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN bin/rails assets:precompile

CMD [ "bin/rails", "server", "-b", "0.0.0.0" ]
```

There's lots of documentation on writing a good Dockerfile
out there already, so I won't go too deep into it.

### Part 2 - Deploying to Kubernetes

The simplest way to deploy to Kubernetes is to simply create
a `k8s/` folder in your project and add a `deployment.yaml`
and `service.yaml`. They'll look something like this:

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysite
  labels:
    app: mysite
  namespace: default
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysite
  template:
    metadata:
      labels:
        app: mysite
    spec:
      containers:
      - name: mysite
        image: 354234691964.dkr.ecr.us-east-1.amazonaws.com/mysite:<TAG>
        ports:
        - containerPort: 3000
        # you should include resources and limits here
        # to avoid starvation of other pods

# service.yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: mysite
  name: mysite-service
  namespace: default
spec:
  ports:
  - port: 3000
    protocol: TCP
    targetPort: 3000
  selector:
    app: mysite
  sessionAffinity: None
  type: NodePort
```

This will create a deployment which will manage a replica set
of the specified image (in this case, `mysite:<TAG>`). If the
server crashes it'll spawn a new container, and kubernetes
handles all the networking logic.

It also creates a service, which will match the pods in the
deployment (see the `spec.selector` section of the service)
and automatically load balance traffic from the service IP
to your app's pods.

After you run `kubectl apply -f k8s/`, it should create the
deployment and service. Now you've manually deployed to
Kubernetes, congrats!

### Part 3 - CI/CD

Deploying manually doesn't scale very well, so ideally we want
a new image built and deployed to the cluster whenever you push
to the `master` branch. Personally I've used GitHub Actions, AWS ECR, and DigitalOcean Kubernetes, but any CI platform,
container registry, and kubernetes provider will work.

The general flow is:

1. On a push to master, login to your container registry
2. Run `docker build .`, tagging the image with the proper tag
(I recommend the short git commit SHA
`git rev-parse --short HEAD`)
3. Push the new image to your container registry
4. Update the Kubernetes deployment and service.
For this step, I recommend using a tool like `helm`,
but you can get away with just running something like
`sed -i 's|<TAG>|'${TAG}'|' $GITHUB_WORKSPACE/devops/deployment.yaml`
5. Verify that the deployment rollout succeeds (
  `kubectl rollout status deployment/mysite`
)

## Common problems

### Database URL

Often, in production you'll point to an RDS DB (or
in general, some separate database instance).
This is pretty easy to deal with in Rails, as you just
need to set the `DATABASE_URL` environment variable.

Using Kubernetes secrets makes this easy, as you can
mount a key from a secret into an environment variable
like this:

```yaml
# spec.template.spec.containers[].env
env:
- name: DATABASE_URL
  valueFrom:
    secretKeyRef:
      name: postgres-secret
      key: mysite
- name: ELASTICSEARCH_URL
  valueFrom:
    secretKeyRef:
      name: elastic-secret
      key: url
```

The secret can be created with

`kubectl create secret generic mysecret --from-literal=mysite=foobar`

Now only people with admin access to the Kubernetes cluster can
access the secret! Note I use the same pattern to pass in
the redis and elasticsearch URLs for my apps. This isn't
revolutionary, but is made very easy with Kubernetes.

### Background workers

Simple: create another deployment just like the first one
but change the command to be `bin/bundle exec sidekiq`.
Now you can scale your web and background processes
independently.
