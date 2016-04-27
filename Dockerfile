FROM mhart/alpine-node:4

RUN apk add --update git make python gcc g++

VOLUME /root/.npm

RUN npm i -g nodemon

ADD package.json /app/
RUN cd /app && npm install
ENV PATH /app/node_modules/.bin:$PATH

ADD . /app/server
WORKDIR /app/server

CMD ["node", "../node_modules/.bin/rapptor"]
