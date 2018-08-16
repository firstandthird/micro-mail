FROM firstandthird/node:8.9-2-onbuild

ENV PORT 8081
EXPOSE 8081

CMD ["rapptor"]
