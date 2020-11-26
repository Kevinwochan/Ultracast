#!/bin/bash
drawio -x -f pdf --crop -o resources drawio/

for f in resources/*.drawio.pdf; do
    mv -- "$f" "${f%.drawio.pdf}.pdf"
done
