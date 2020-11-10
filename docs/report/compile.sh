#!/bin/bash
bash compile_drawio.sh

latexmk -shell-escape -pdf -file-line-error -outdir=build report.tex
