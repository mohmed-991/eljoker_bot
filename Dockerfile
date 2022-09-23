FROM aquabotwa/sanuwa-official:md-beta

RUN git clone https://github.com/mohmed-991/hetlar_bot /root/bobiz
WORKDIR /root/bobiz/
ENV TZ=Europe/Istanbul
RUN yarn add supervisor -g
RUN yarn install --no-audit

CMD ["node", "index.js"]
