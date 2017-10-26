# ==================================================================================================
# This Docker image runs an HTTP server that serves the Super Tech Heroes Lambda function.
#
# You can run this docker image using the following CLI command:
#
#     docker run -p 8080:8080 -p 7070:7070 bigstickcarpet/super-tech-heroes
#
# And then you can access the Super Tech Heroes API at http://localhost:8080,
# and the Super Tech Heroes website at http://localhost:7070
# ==================================================================================================

FROM node:6

RUN mkdir -p /var/super-tech-heroes
WORKDIR /var/super-tech-heroes

COPY bin bin
COPY lib lib
COPY docs docs
COPY package.json package.json
COPY package-lock.json package-lock.json

ENV NODE_ENV="production"
RUN npm install --production

EXPOSE 7070
EXPOSE 8080

ENTRYPOINT ["node", "bin/server.js"]
