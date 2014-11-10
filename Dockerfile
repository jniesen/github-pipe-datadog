FROM ubuntu:latest
MAINTAINER Jonathan Niesen <jon.niesen@gmail.com>

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm

EXPOSE 3000

WORKDIR /srv/github_pipe_datadog

CMD ["./start"]
