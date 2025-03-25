#!/bin/bash

pip install -r requirements.txt

protoc -I=./proto --python_out=. ./proto/agent.proto

python the_circle_server.py