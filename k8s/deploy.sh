#!/bin/bash

kubectl create secret generic crawler-app-credential --from-file=crawler-app-credential.json
kubectl apply -f BlockChainCrawler.cronjob.yml