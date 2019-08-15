all: resume.pdf

resume.pdf: resume.tex
	$(MAKE) clean
	latexmk -synctex=1 -interaction=nonstopmode -file-line-error -pdf
	cp resume.pdf ../public/tyler_boyd.pdf

resume.tex:

clean:
	rm -f resume.aux resume.dvi resume.fdb_latexmk resume.fls resume.log resume.synctex.gz resume.pdf
