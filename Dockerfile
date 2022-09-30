FROM aquabotwa/sanuwa-official:md-beta

RUN git clone https://github.com/mahmoud-medhat0/hetlar_bot/ /root/bobiz
WORKDIR /root/bobiz/
ENV TZ=Europe/Istanbul
RUN yarn add supervisor -g
RUN yarn add random                 
RUN yarn install --no-audit

CMD ["node", "index.js"]
