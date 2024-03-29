FROM node:14-slim
RUN apt update && apt install -y \
      curl \
      openssh-client \
      ca-certificates \
      supervisor \
      cron \
      git \
      procps
RUN ln -s $(which node) /usr/bin/node && ln -s $(which npm) /usr/bin/npm
RUN curl -sSL https://get.docker.com/ -o get-docker.sh && sh get-docker.sh || apt update && apt install -y docker-ce-cli
RUN curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose && ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

ENV CRON_PATH /etc/crontabs

ENV GIT_REPO ""
ENV GIT_BRANCH "master"
ENV GIT_SSH_COMMAND "ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"

WORKDIR /app
COPY . .
COPY supervisord.conf /etc/supervisord.conf
RUN npm install --only=prod  && npm run build
CMD ["supervisord", "-c", "/etc/supervisord.conf"]