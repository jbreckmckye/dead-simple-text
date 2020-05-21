#!/bin/bash

npm run build
echo "Build done:"
ls

cp ./dist/** .
echo "Dist folder expanded:"
ls
