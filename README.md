# github | datadog

A simple micro-service that takes a github event in and outputs an event to datadog.

## Running

```shell
export DOCKER_REPO=jniesen/github-pipe-datadog \
 && docker pull $DOCKER_REPO \
  && docker run -d -e DD_API_KEY=[Your Account's Datadog API Key] -e DD_APP_KEY=[Your App's Datadog API Key] -p [Open Host Port]:3000 $DOCKER_REPO
```

## Developing

On workstation (dev docker host):

```shell
git clone git@github.com:jniesen/github-pipe-datadog.git
docker pull jniesen/github-pipe-datadog
docker run -i -t \
  -v $(pwd):/srv/github_pipe_datadog \
  -e DD_API_KEY=[Your Account's Datadog API Key] \
  -e DD_APP_KEY=[Your App's Datadog API Key] \
  -p [Open Host Port]:3000 jniesen/github-pipe-datadog \
  /bin/bash
```

Inside container:

```shell
./start
```

Whenever you make and save a change in your IDE (outside the docker container) you will have to restart the applications (inside the docker container).


