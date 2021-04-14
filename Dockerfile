FROM node:alpine
WORKDIR /Personal-timetable-checker
COPY . .
CMD ["node", "index.js"]
