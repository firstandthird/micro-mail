FROM firstandthird/node

ADD . /app/server
WORKDIR /app/server

CMD ["node", "../node_modules/.bin/rapptor"]
