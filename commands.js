const {
    default: makeWASocket,
    useSingleFileAuthState,
    DisconnectReason,
    getContentType,
    jidDecode
} = require('@adiwajshing/baileys')

const config = require('./config');
const ffmpeg = require('fluent-ffmpeg');
const { execFile } = require('child_process');
const cwebp = require('cwebp-bin');
const { exec } = require('child_process');
const { sms } = require('./lib/message');
const random = require('random');
const { imageToWebp, videoToWebp, writeExif } = require('./lib/stic')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep } = require('./lib/functions')
const fs = require('fs');
const request = require("request"),
    path = '/tmp';
const ownerNumber = ['201148422820']
const prefix = '.'
const axios = require('axios');
const { yt720, yt480, yt360 } = require('./lib/ytmp4');
const ytmp3 = require('./lib/ytmp3');
const apk_link = require('./lib/playstore');
const yts = require('yt-search')
const cheerio = require('cheerio');


async function ytinfo(name) {

    let arama = await yts(name);
    arama = arama.all;
    if (arama.length < 1) {
        let result = { status: false }
        return result
    } else {
        let thumbnail = arama[0].thumbnail;
        let title = arama[0].title.replace(/ /gi, '+');
        let title2 = arama[0].title
        let views = arama[0].views;
        let author = arama[0].author.name;
        let url = arama[0].url
        let result = {
            msg: '╔══[卍 Mohamed 𝙱𝙾𝚃 卍]══╗\n╠  *📥YT DOWNLOADER تحميل الفيديوات من اليوتوب📤*  ╣\n╚═════════════╝\n\n║📽️ɴᴀᴍᴇ: ' + title2 + '\n\n║👁️ᴠɪᴇᴡs: ' + views + '\n\n║📹 ᴄʜᴀɴɴᴇʟ: ' + author + '\n\n║🖇️ᴜʀʟ: ' + url + '\n\n╚═══════════◈',
            thumbnail: thumbnail,
            yuturl: url
        }
        return result

    }
}


async function cmd(conn, mek) {

    try {

        mek = mek.messages[0]
        if (!mek.message) return

        mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        const type = getContentType(mek.message)
        const content = JSON.stringify(mek.message)
        const from = mek.key.remoteJid

        const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
        const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'listResponseMessage') && mek.message.listResponseMessage.singleSelectReply.selectedRowId ? mek.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'buttonsResponseMessage') && mek.message.buttonsResponseMessage.selectedButtonId ? mek.message.buttonsResponseMessage.selectedButtonId : (type == "templateButtonReplyMessage") && mek.message.templateButtonReplyMessage.selectedId ? mek.message.templateButtonReplyMessage.selectedId : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''

        const isCmd = body.startsWith(prefix)
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
        const args = body.trim().split(/ +/).slice(1)
        const q = args.join(' ')
        const isGroup = from.endsWith('@g.us')
        const sender = mek.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
        const senderNumber = sender.split('@')[0]
        const botNumber = conn.user.id.split(':')[0]
        const pushname = mek.pushName || 'unknown'

        const isMe = botNumber.includes(senderNumber)
        const isOwner = ownerNumber.includes(senderNumber) || isMe


        switch (command) {

            // alive //  

            case 'alive':
                try {
                    var alivemsg = ''
                    if (config.ALIVEMSG == 'default') alivemsg = '```👋 Hi! I am online now. مرحبا أنا متصل الان في خدمتك سيدي😉```'
                    if (config.ALIVEMSG !== 'default') alivemsg = config.ALIVEMSG
                    const templateButtons = [
                        { urlButton: { displayText: config.URL_1NAME, url: config.URL_1LINK } },
                        { urlButton: { displayText: config.URL_2NAME, url: config.URL_2LINK } },
                        { quickReplyButton: { displayText: 'MENU', id: prefix + 'menu' } },
                        { quickReplyButton: { displayText: 'OWNER', id: prefix + 'owner' } }
                    ]
                    const buttonMessage = {
                        caption: alivemsg,
                        footer: config.FOOTER,
                        templateButtons: templateButtons,
                        image: { url: config.ALIVE_LOGO }
                    }
                    await conn.sendMessage(from, buttonMessage)
                } catch (e) {

                    return
                }
                break


                //_______________________________________________________________________________________________________________________________________________________   //      
                // sticker //  


            case 'sticker':
            case 's':
            case 'stic':
                const v = sms(conn, mek)
                const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
                const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
                const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false
                    // await conn.sendMessage(from, { text: mtype }, { quoted: mek })
                if ((v.type === 'imageMessage') || isQuotedImage) {
                    const cstic = await conn.sendMessage(from, { text: 'creating جاري صناعة الملصق' }, { quoted: mek })
                    var nameJpg = getRandom('')
                    isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
                    var stik = await imageToWebp(nameJpg + '.jpg')
                    writeExif(stik, { packname: config.STIC_WM, author: '' })
                        .then(x => v.replyS(x))
                    await conn.sendMessage(from, { delete: cstic.key })
                } else if ((v.type === 'videoMessage') || isQuotedVideo) {
                    // await conn.sendMessage(from, { text: v.type }, { quoted: mek }) // await conn.sendMessage(from, { text: mtype }, { quoted: mek })
                    // await conn.sendMessage(from, { text: isQuotedVideo }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'creating' }, { quoted: mek })
                    var nameMp4 = getRandom('')
                    isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
                    var stik = await videoToWebp(nameMp4 + '.mp4')
                    writeExif(stik, { packname: config.STIC_WM, author: '' })
                        .then(x => v.replyS(x))
                        // await conn.sendMessage(from, { delete: cstic.key })
                } else {
                    v.reply('فين الصورة او افيديو اللي عاوز تحولهم يغالي')
                }
                break;
                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //      
            case 'sticget':
            case 'stickget':
            case 'take':
            case 'wm':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'enter packname and creater name\n ex : ' + prefix + 'sticget bobiz sticker;multi device' }, { quoted: mek })
                    var packname = ''
                    var creater = ''
                    if (q.includes(';')) {
                        var split = q.split(';');
                        packname = split[0];
                        creater = split[1]
                    } else {
                        packname = q;
                        creater = '';
                    }
                    const v = sms(conn, mek)
                    const isQuotedViewOnce = v.quoted ? (v.quoted.type === 'viewOnceMessage') : false
                    const isQuotedImage = v.quoted ? ((v.quoted.type === 'imageMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'imageMessage') : false)) : false
                    const isQuotedVideo = v.quoted ? ((v.quoted.type === 'videoMessage') || (isQuotedViewOnce ? (v.quoted.msg.type === 'videoMessage') : false)) : false

                    const isQuotedSticker = v.quoted ? (v.quoted.type === 'stickerMessage') : false
                    if ((v.type === 'imageMessage') || isQuotedImage) {
                        const cstic = await conn.sendMessage(from, { text: 'creating' }, { quoted: mek })
                        var nameJpg = getRandom('')
                        isQuotedImage ? await v.quoted.download(nameJpg) : await v.download(nameJpg)
                        var stik = await imageToWebp(nameJpg + '.jpg')
                        writeExif(stik, { packname: packname, author: creater })
                            .then(x => v.replyS(x))
                        await conn.sendMessage(from, { delete: cstic.key })
                    } else if ((v.type === 'videoMessage') || isQuotedVideo) {
                        const cstic = await conn.sendMessage(from, { text: 'creating' }, { quoted: mek })
                        var nameMp4 = getRandom('')
                        isQuotedVideo ? await v.quoted.download(nameMp4) : await v.download(nameMp4)
                        var stik = await videoToWebp(nameMp4 + '.mp4')
                        writeExif(stik, { packname: packname, author: creater })
                            .then(x => v.replyS(x))
                        await conn.sendMessage(from, { delete: cstic.key })
                    } else if (isQuotedSticker) {
                        const cstic = await conn.sendMessage(from, { text: 'creating' }, { quoted: mek })
                        var nameWebp = getRandom('')
                        await v.quoted.download(nameWebp)
                        writeExif(nameWebp + '.webp', { packname: packname, author: creater })
                            .then(x => v.replyS(x))
                        await conn.sendMessage(from, { delete: cstic.key })
                    } else {
                        v.reply('reply to sticker , image or video')
                    }
                } catch (e) {
                    return

                }
                break


                //_______________________________________________________________________________________________________________________________________________________   //		      
                // mediafire //

            case "mediafire":
            case "mfire":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'أين هو رابط الميديافاير الدي تود تحميله يا عزيزي' }, { quoted: mek })
                    if (!q.includes('mediafire.com/file')) return await conn.sendMessage(from, { text: 'need mediafire link' }, { quoted: mek })
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/mfire?url=' + q)
                    const file = data.data
                    if (file.filesize > 150000) return await conn.sendMessage(from, { text: mx }, { quoted: mek })
                    const fileup = await conn.sendMessage(from, { text: config.FILE_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.FILE_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { document: { url: file.url }, mimetype: file.ext, fileName: file.filename }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'تعذر تحميل الملف آسف صديقي\n\n' + e }, { quoted: mek })
                }

                break


                //_______________________________________________________________________________________________________________________________________________________   //		      
                // instagram //

            case "ig":
            case "instagram":
            case "insta":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'أين هو رابط فيديو انستغرام الدي تود تحميله عزيزي ' }, { quoted: mek })
                    if (!q.includes('instagram.com')) return await conn.sendMessage(from, { text: 'need instagram link' }, { quoted: mek })
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/ig?url=' + q)
                    const file = data.data[0]

                    const fileup = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { video: { url: file.downloadUrl }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }

                break

                //_______________________________________________________________________________________________________________________________________________________   //	      
                // tiktok //

            case "tik":
            case "tk":
            case "tiktok":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    if (!q.includes('tiktok')) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/tiktok?url=' + q)
                    const file = data.data
                    const fileup = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { video: { url: file.no_watermark }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }

                break
            case "tk2":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    if (!q.includes('tiktok')) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    const data = await axios.get('http://api-tests.orgfree.com/tk.php?url=' + q)
                    const file = data.data.links[0].a
                    const fileup = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { video: { url: file }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }

                break
            case 'tk2audio':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    if (!q.includes('tiktok')) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    const data = await axios.get('http://api-tests.orgfree.com/tk.php?url=' + q);
                    let file = data.data.links[4].a
                    const docsongdown = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    await conn.sendMessage(from, { audio: { url: file }, mimetype: 'audio/mp4' }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break
                audio / mpeg
            case 'tk2mp3':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    if (!q.includes('tiktok')) return await conn.sendMessage(from, { text: 'need tiktok link' }, { quoted: mek })
                    const data = await axios.get('http://api-tests.orgfree.com/tk.php?url=' + q);
                    let file = data.data.links[4].a
                    const docsongdown = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    await conn.sendMessage(from, { audio: { url: file }, mimetype: 'audio/mpeg' }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break
            case 'sc':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need soundcloud link' }, { quoted: mek })
                    if (!q.includes('soundcloud')) return await conn.sendMessage(from, { text: 'need soundcloud link' }, { quoted: mek })
                    const data = await axios.get('https://zenzapis.xyz/downloader/soundcloud?apikey=a098573f47&url=' + q);
                    let file = data.data.result.url
                    const docsongdown = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    await conn.sendMessage(from, { audio: { url: file }, mimetype: 'audio/mpeg' }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break
            case 'songyt':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need youtube link' }, { quoted: mek })
                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need youtube link' }, { quoted: mek })
                    const data2 = await axios.get('https://api.snappea.com/v1/video/details?url=' + q);
                    const file1 = data2.data['videoInfo']['downloadInfoList']
                    if (file1.length < 1) return await conn.sendMessage(from, { text: e2Lang.N_FOUND }, { quoted: mek });
                    var srh = [];
                    const title = data2.data['videoInfo']["title"]
                    for (var i = 0; i < file1.length; i++) {
                        srh.push({
                            title: data2.data['videoInfo']['downloadInfoList'][i]['formatExt'] + ' - ' + data2.data['videoInfo']['downloadInfoList'][i]['formatAlias'],
                            description: '',
                            rowId: prefix + 'send' + " " + data2.data['videoInfo']['downloadInfoList'][i].partList[0]['urlList'][0] + '_@' + data2.data['videoInfo']['downloadInfoList'][i]['formatExt'] + '_@' + title
                        });
                    }
                    const sections = [{
                        title: "search results",
                        rows: srh
                    }]
                    const listMessage = {
                            text: " name : " + data2.data['videoInfo']["title"],
                            footer: config.FOOTER,
                            title: '卍 Mohamed 𝙱𝙾𝚃 卍 التحميل من اليوتيوب',
                            buttonText: "النتائج اضغط هنا",
                            sections
                        }
                        // console.log(listMessage1)
                    await conn.sendMessage(from, listMessage, { quoted: mek })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break
            case 'send':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need file link -ext -title' }, { quoted: mek })
                    var ext = q.split('_@')[1];
                    const title = q.split('_@')[2];
                    switch (ext) {
                        case 'mp3':
                            const msg = '╔══[卍 Mohamed 𝙱𝙾𝚃 卍]══╗\n╠   📥YOUTUBE MP3 DL📤 ║\n╚═════════════╝\n\n║ select mp3 type \n\n╚═════════════◈'
                            const buttons = [
                                { buttonId: prefix + 'ausong ' + q.split('_@')[0] + '_@' + title, buttonText: { displayText: 'AUDIO' }, type: 1 },
                                { buttonId: prefix + 'dcsong ' + q.split('_@')[0] + '_@' + title, buttonText: { displayText: 'DOCUMENT ' }, type: 1 },
                            ]
                            await conn.sendMessage(from, { text: msg, footer: config.FOOTER, buttons: buttons, headerType: 4 }, { quoted: mek })
                            break;
                        case 'mp4':
                            await conn.sendMessage(from, { text: ext }, { quoted: mek })
                            await conn.sendMessage(from, { text: title }, { quoted: mek })
                            const fileup = await conn.sendMessage(from, { text: config.FILE_DOWN }, { quoted: mek })
                            await conn.sendMessage(from, { delete: fileup.key })
                            const filedown = await conn.sendMessage(from, { text: config.FILE_UP }, { quoted: mek })
                                // const media = await request.get(q).on('error', function(err) { console.log(err) }).pipe(fs.createWriteStream('tmp' + ext));
                                // const media1 = media.on("finish", () => {
                                //     return fs.statSync('tmp' + ext).size;
                                // });
                                // const file = './2.weba'
                                // const doc = await conn.sendMessage(from, { document: { url: file } }, { quoted: mek })
                                // await exec(`ffmpeg -i 2.weba -vn -ar 44100 -ac 2 -b:a 192k 2.mp3`);
                                // const bytesToMegaBytes = bytes => bytes / (1024 ** 2);
                                // const size1 = bytesToMegaBytes(media1);
                                // await conn.sendMessage(from, { text: size1 }, { quoted: mek })
                                // if (size1 > 200) return await conn.sendMessage(from, { text: 'الملف الذي تريده حجمه كبير لا يمكن للبوت ان يرسله الحد الاقصى هو 200 ميغا' }, { quoted: mek })
                            console.log(title + '.' + ext)
                            const doc = await conn.sendMessage(from, { video: { url: q.split('_@')[0] }, caption: config.CAPTION }, { quoted: mek })
                            await conn.sendMessage(from, { delete: filedown.key });
                            // try {
                            //     fs.unlinkSync(path + 'tmp' + '.' + ext)
                            // } catch (err) {
                            //     console.error(err)
                            // }
                            break;
                    }
                } catch (e) {
                    await conn.sendMessage(from, { text: 'تعذر ارسال الملف آسف صديقي \n\n' + e }, { quoted: mek })
                        // try {
                        //     fs.unlinkSync(path + 'tmp' + ext)
                        // } catch (err) {
                        //     console.error(err)
                        // }

                }
                break
                //_______________________________________________________________________________________________________________________________________________________   //		      
                // facebook //
            case 'send1':
                if (isOwner) {
                    await conn.sendMessage(from, { document: { url: q }, fileName: q }, { quoted: mek })
                }
                break

            case 'fb':
            case 'facebook':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need fb link  اين هو رابط فيديو الفيسبوك الذي تريد تحميله' }, { quoted: mek })
                    const isfb = q.includes('facebook.com') ? q.includes('facebook.com') : q.includes('fb.watch') ? q.includes('fb.watch') : ''
                    if (!isfb) return await conn.sendMessage(from, { text: 'need fb link' }, { quoted: mek })
                    const msg = '╔══[卍 HETLAR 𝙱𝙾𝚃 卍]══╗\n╠  *📥FB DOWNLOADER📤*  ╣\n╚═════════════╝\n\n║ اختر الجودة التي تريدها \n\n╚═════════════◈'
                    const buttons = [
                        { buttonId: prefix + 'sdfb ' + q, buttonText: { displayText: 'SD ' }, type: 1 },
                        { buttonId: prefix + 'hdfb ' + q, buttonText: { displayText: 'HD ' }, type: 1 },
                    ]
                    await conn.sendMessage(from, { text: msg, footer: config.FOOTER, buttons: buttons, headerType: 4 }, { quoted: mek })

                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case 'hdfb':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need fb link' }, { quoted: mek })
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/fb?url=' + q)
                    const file = data.data[0]
                    const fileup = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { video: { url: file.url }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   

            case 'sdfb':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need fb link' }, { quoted: mek })
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/fb?url=' + q)
                    const file = data.data[1]
                    const fileup = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { video: { url: file.url }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break
                //_______________________________________________________________________________________________________________________________________________________   //		      

                // youtube //

            case 'yt':
            case 'ytd':
            case 'song':
            case 'video':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need title' }, { quoted: mek })
                    const ytl = await ytinfo(q)
                    const buttons = [
                        { buttonId: prefix + 'ytmp3 ' + ytl.yuturl, buttonText: { displayText: 'MP3' }, type: 1 },
                        { buttonId: prefix + 'ytmp4 ' + ytl.yuturl, buttonText: { displayText: 'MP4' }, type: 1 },
                    ]
                    await conn.sendMessage(from, { image: { url: ytl.thumbnail }, caption: ytl.msg, footer: config.FOOTER, buttons: buttons, headerType: 4 }, { quoted: mek })

                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		 

            case 'ytmp3':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })

                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    const msg = '╔══[卍 Mohamed 𝙱𝙾𝚃 卍]══╗\n╠   📥YOUTUBE MP3 DL📤 ║\n╚═════════════╝\n\n║ select mp3 type \n\n╚═════════════◈'
                    const buttons = [
                        { buttonId: prefix + 'ausong ' + q, buttonText: { displayText: 'AUDIO' }, type: 1 },
                        { buttonId: prefix + 'dcsong ' + q, buttonText: { displayText: 'DOCUMENT ' }, type: 1 },
                    ]
                    await conn.sendMessage(from, { text: msg, footer: config.FOOTER, buttons: buttons, headerType: 4 }, { quoted: mek })

                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case 'ytmp4':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })

                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    const msg = '╔══[卍 Mohamed 𝙱𝙾𝚃 卍]══╗\n╠   📥YOUTUBE MP4 DL📤 ║\n╚═════════════╝\n\n║ select video quality\n\n╚═════════════◈'
                    const buttons = [
                        { buttonId: prefix + '720vid ' + q, buttonText: { displayText: '720P' }, type: 1 },
                        { buttonId: prefix + '480vid ' + q, buttonText: { displayText: '480P ' }, type: 1 },
                    ]
                    await conn.sendMessage(from, { text: msg, footer: config.FOOTER, buttons: buttons, headerType: 4 }, { quoted: mek })

                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case 'dcsong':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need dl link' }, { quoted: mek })
                    const title = q.split('_@')[1];
                    const docsongdown = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    const doc = await conn.sendMessage(from, { document: { url: q.split('_@')[0] + '.mp3' }, mimetype: 'audio/mpeg', fileName: title + '.mp3' }, { quoted: mek })

                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case 'ausong':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    const title = q.split('_@')[1];
                    const docsongdown = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    await conn.sendMessage(from, { audio: { url: q.split('_@')[0] + '.mp3' }, mimetype: 'audio/mp4', fileName: title + '.m4a' }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break


            case 'ausong2':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    const data = await axios.get('https://zenzapis.xyz/downloader/y2mate?apikey=8833301e7333&query=' + q);
                    const file = data.data.result.getAudio
                    const fileup = await conn.sendMessage(from, { text: config.SONG_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.SONG_UP }, { quoted: mek })
                    await conn.sendMessage(from, { audio: { url: file.mp3 }, mimetype: 'audio/mp4' }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break
                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case '720vid':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })

                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    let docsong = await yt720(q)
                    const docsongdown = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    await conn.sendMessage(from, { video: { url: docsong.url }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })


                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case '480vid':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })

                    if (!q.includes('youtu')) return await conn.sendMessage(from, { text: 'need yt link' }, { quoted: mek })
                    let docsong = await yt480(q)
                    const docsongdown = await conn.sendMessage(from, { text: config.VIDEO_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongdown.key })
                    const docsongup = await conn.sendMessage(from, { text: config.VIDEO_UP }, { quoted: mek })
                    await conn.sendMessage(from, { video: { url: docsong.url }, caption: config.CAPTION }, { quoted: mek })
                    await conn.sendMessage(from, { delete: docsongup.key })

                } catch (e) {
                    const mg12 = 'في حاله وجود اي خطأ او اقتراح برجاء التواصل مع المطور'
                    await conn.sendMessage(from, { text: mg12 }, { quoted: mek })
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break
                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      
            case 'yts':
                if (!q) return await conn.sendMessage(from, { text: 'أكتب عنوان الفيديو الدي تود البحث عنه' }, { quoted: mek })
                try {
                    const data2 = await axios.get(encodeURI('http://api-tests.orgfree.com/yts.php?search=' + q));
                    const ytss = data2.data['results']
                    if (ytss.length < 1) { await conn.sendMessage(from, { text: 'لم يتم العثور على اي شيء ' }, { quoted: mek }) } else {
                        var srh = [];
                        const title = 'نتائج البحث عن ' + q
                        for (var i = 0; i < ytss.length; i++) {
                            srh.push({
                                title: data2.data['results'][i]['title'],
                                description: 'time : ' + data2.data['results'][i]['time'] + ' views : ' + data2.data['results'][i]['view'],
                                rowId: prefix + 'songyt' + " https://www.youtube.com/watch?v=" + data2.data['results'][i]['url']
                            });
                        }
                        const sections = [{
                            title: "search results",
                            rows: srh
                        }]
                        const listMessage = {
                                text: title,
                                footer: config.FOOTER,
                                title: '卍 Mohamed 𝙱𝙾𝚃 卍\n البحث في يوتيوب',
                                buttonText: "النتائج اضغط هنا",
                                sections
                            }
                            // console.log(listMessage1)
                        await conn.sendMessage(from, listMessage, { quoted: mek })

                    }
                } catch (e) {
                    await conn.sendMessage(from, { text: 'error' + e }, { quoted: mek })
                }
                break
            case 'yts0':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'أكتب عنوان الفيديو الدي تود البحث عنه' }, { quoted: mek })
                    try {
                        var arama = await yts(q);
                    } catch (e) {
                        return await conn.sendMessage(from, { text: 'لم يتم العثور على اي شيء ' }, { quoted: mek })
                    }
                    var mesaj = '';
                    arama.all.map((video) => {
                        mesaj += ' *🖲️' + video.title + '*\n🔗 ' + video.url + '\n\n'
                    });
                    const srcres = await conn.sendMessage(from, { text: mesaj }, { quoted: mek })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }
                break

                //_______________________________________________________________________________________________________________________________________________________   //		      

                // playstore // 

            case "apk":
            case "findapk":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'اين هو اسم الاتطبيق الذي تريد تحميله' }, { quoted: mek })
                    const data2 = await axios.get('https://bobiz-api.herokuapp.com/api/playstore?q=' + q)
                    const data = data2.data
                    if (data.length < 1) return await conn.sendMessage(from, { text: e2Lang.N_FOUND }, { quoted: mek })
                    var srh = [];
                    for (var i = 0; i < data.length; i++) {
                        srh.push({
                            title: data[i].title,
                            description: '',
                            rowId: prefix + 'dapk ' + data[i].link
                        });
                    }
                    const sections = [{
                        title: "البحث في بلاي ستور",
                        rows: srh
                    }]
                    const listMessage = {
                        text: " \n\n name : " + q + '\n\n ',
                        footer: config.FOOTER,
                        title: '卍 Mohamed 𝙱𝙾𝚃 卍 تحميل التطبيقات',
                        buttonText: "نتائج البحث اضغط هنا",
                        sections
                    }
                    await conn.sendMessage(from, listMessage, { quoted: mek })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }

                break

            case "apkmody":
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'اين هو اسم الاتطبيق المهكر الذي تريد تحميله' }, { quoted: mek })
                    const key = await axios.get('https://pastebin.com/raw/X97zMjVc')
                    const data2 = await axios.get('https://zenzapis.xyz/webzone/apkmody?apikey=' + key.data + '&query=' + q)
                    const data = data2.data['result'];
                    console.log(data)
                    if (data.length < 1) return await conn.sendMessage(from, { text: e2Lang.N_FOUND }, { quoted: mek })
                    var srh = [];
                    for (var i = 0; i < data.length; i++) {
                        srh.push({
                            title: data[i].name,
                            description: '',
                            rowId: prefix + 'dapkm ' + data[i].link + '@_' + data[i].name
                        });
                    }
                    const sections = [{
                        title: "search results",
                        rows: srh
                    }]
                    const listMessage = {
                        text: " \n\n name : " + q + '\n\n ',
                        footer: config.FOOTER,
                        title: '卍 Mohamed 𝙱𝙾𝚃 卍 تحميل التطبيقات المهكرة',
                        buttonText: "نتائج البحث اضغط هنا",
                        sections
                    }
                    await conn.sendMessage(from, listMessage, { quoted: mek })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'error' }, { quoted: mek })
                }

                break
            case 'dapkm':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need apk mody link -title' }, { quoted: mek })
                    const title = q.split('@_')[1];
                    const data = await axios.get('http://api-tests.orgfree.com/apkmodydl.php?url=' + q.split('@_')[0])
                    await conn.sendMessage(from, { text: q.split('@_')[1] }, { quoted: mek })
                    const name = data.data
                    const fileup = await conn.sendMessage(from, { text: config.FILE_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.FILE_UP }, { quoted: mek })
                    const media = request(name).pipe(fs.createWriteStream(path + '/tmp.apk'));
                    const media1 = media.on("finish", () => {
                        return fs.statSync(path + '/tmp.apk').size;
                    });
                    const bytesToMegaBytes = bytes => bytes / (1024 ** 2);
                    const size1 = bytesToMegaBytes(media1);
                    if (size1 > 200) return await conn.sendMessage(from, { text: 'التطبيق الذي تريده حجمه كبير لا يمكن للبوت ان يرسله الحد الاقصى هو 200 ميغا' }, { quoted: mek })
                    await conn.sendMessage(from, { document: { url: name }, mimetype: 'application/vnd.android.package-archive', fileName: title }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                    try {
                        fs.unlinkSync(path + '/tmp.apk')
                    } catch (err) {
                        console.error(err)
                    }
                } catch (e) {
                    await conn.sendMessage(from, { text: 'تعذر ارسال التطبيق آسف صديقي \n\n' + e }, { quoted: mek })
                    try {
                        fs.unlinkSync(path + '/tmp.apk')
                    } catch (err) {
                        console.error(err)
                    }

                }

                break

                // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      

            case 'dapk':
                try {
                    if (!q) return await conn.sendMessage(from, { text: 'need app link' }, { quoted: mek })
                    const n = q.replace('/store/apps/details?id=', '')
                    const data = await axios.get('https://bobiz-api.herokuapp.com/api/apk?url=https://play.google.com/store/apps/details?id=' + n)
                    const name = data.data.name
                    const fileup = await conn.sendMessage(from, { text: config.FILE_DOWN }, { quoted: mek })
                    await conn.sendMessage(from, { delete: fileup.key })
                    const filedown = await conn.sendMessage(from, { text: config.FILE_UP }, { quoted: mek })

                    const app_link = await apk_link(n)
                    if (app_link.size.replace('MB', '') > 200) return await conn.sendMessage(from, { text: 'التطبيق الذي تريده حجمه كبير لا يمكن للبوت ان يرسله الحد الاقصى هو 200 ميغا' }, { quoted: mek })
                    if (app_link.size.includes('GB')) return await conn.sendMessage(from, { text: ' التطبيق الذي تريده حجمه كبير لا يمكن للبوت ان يرسله الحد الاقصى هو 200 ميغا' }, { quoted: mek })
                    var ext = ''
                    if (app_link.type.includes('Download XAPK')) { ext = '.xapk' } else { ext = '.apk' }
                    await conn.sendMessage(from, { document: { url: app_link.dl_link }, mimetype: 'application/vnd.android.package-archive', fileName: name + ext }, { quoted: mek })
                    await conn.sendMessage(from, { delete: filedown.key })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'تعذر ارسال التطبيق آسف صديقي \n\n' + e }, { quoted: mek })
                }

                break
                //_______________________________________________________________________________________________________________________________________________________   //		      
                // menu // 	   
            case 'menuv':
                try {
                    const file = './src/video.mp4'
                    const doc = await conn.sendMessage(from, { video: { url: file } }, { quoted: mek })
                } catch (e) {
                    await conn.sendMessage(from, { text: 'error\n\n' + e }, { quoted: mek })
                }
                break
            case 'menu':
                var srh = [];
                srh.push({
                    "title": "معلومات عن البوت  ",
                    "description": "",
                    "rowId": prefix + 'menuv2'
                }, {
                    "title": "هل البوت يعمل ام لا ",
                    "description": "",
                    "rowId": prefix + 'alive'
                }, {
                    "title": "التواصل مع المطور ",
                    "description": "",
                    "rowId": prefix + 'owner'
                }, {
                    "title": "عرض قائمه الاوامر",
                    "description": ".menu1",
                    "rowId": prefix + 'menu1'
                }, {
                    "title": "مشاهده فيديو البوت",
                    "description": "",
                    "rowId": prefix + 'menuv'
                }, {
                    "title": "التحميل من التيكتوك (السيرفر البديل)",
                    "description": ".tk2 رابط الفيديو",
                    "rowId": prefix + 'tk2'
                }, {
                    "title": "تحميل صوت فيديو التيكتوك",
                    "description": ".tk2audio رابط الفيديو",
                    "rowId": prefix + 'tk2audio'
                }, {
                    "title": "تحميل التطبيقات المهكرة (apk mody)",
                    "description": ".apkmody اسم التطبيق",
                    "rowId": prefix + 'apkmody'
                }, {
                    "title": "تحميل اغنيه من الساوند كلاود",
                    "description": ".sc رابط الاغنيه على الساوند كلاود",
                    "rowId": prefix + 'sc'
                }, {
                    "title": "صناعه ملصق ",
                    "description": ".sticker مع الرد على الصورة المراد تحويلها ",
                    "rowId": prefix + 'sticker'
                }, {
                    "title": "صناعه ملصق مع تغيير الحقوق ",
                    "description": ".stickget مع الرد على الصورة المراد تحويلها ",
                    "rowId": prefix + 'stickget'
                }, {
                    "title": "تحميل التطبيقات",
                    "description": ".apk اسم التطبيق",
                    "rowId": prefix + 'apk'
                }, {
                    "title": "التحميل من الفيسبوك",
                    "description": ".fb رابط الفيديو",
                    "rowId": prefix + 'fb'
                }, {
                    "title": "التحميل من الانستجرام",
                    "description": ".ig رابط الفيديو",
                    "rowId": prefix + 'ig'
                }, {
                    "title": "البحث في يوتيوب",
                    "description": ".yts المراد البحث عنه ",
                    "rowId": prefix + 'yts'
                }, {
                    "title": "تحميل الموسيقى",
                    "description": ".song اسم الاغنيه او الرابط",
                    "rowId": prefix + '.song'
                }, {
                    "title": "التحميل من يوتيوب",
                    "description": ".yt الرابط او الاسم",
                    "rowId": prefix + 'yt'
                }, {
                    "title": "التمحيل من ميديا فاير",
                    "description": ".mediafire الرابط",
                    "rowId": prefix + 'mediafire'
                });
                const sections = [{
                    title: "قائمه الاوامر",
                    rows: srh
                }]
                const listMessage = {
                    text: "قائمه الاوامر يا عزيزي",
                    footer: config.FOOTER,
                    title: '卍 Mohamed 𝙱𝙾𝚃 卍',
                    buttonText: "قائمه الاوامر",
                    sections
                }
                await conn.sendMessage(from, listMessage, { quoted: mek })
                break
            case 'menuv2':
            case 'list':
            case 'panal':
                const msg1 =
                const msg2 = 
                await conn.sendMessage(from, { text: msg1 }, { quoted: mek })
                await conn.sendMessage(from, { text: msg2 }, { quoted: mek })

                break
            case 'update':
                if (isOwner) {
                    await exec(`git pull`, function(error, stdout, stderr) {
                        console.log(stdout);
                        conn.sendMessage(from, { text: stdout }, { quoted: mek });
                    });
                } else {
                    conn.sendMessage(from, { text: `iam sorry you aren,t owner` }, { quoted: mek });
                }
                break
            case 'exec':
                if (isOwner) {
                    await exec(q, function(error, stdout, stderr) {
                        console.log(stdout);
                        console.log(error);
                        conn.sendMessage(from, { text: error || stdout }, { quoted: mek });
                    });
                } else {
                    conn.sendMessage(from, { text: `iam sorry you aren,t owner` }, { quoted: mek });
                }
                break
            case 'menu1':
                const msg11 = `╭────────────────────╮
				卍 Mohamed 𝙱𝙾𝚃 卍
╰────────────────────╯
╭───────────────────────╮
│ ❀  engineer_mohamed_adel991                        
╰───────────────────────╯
instagram.com/engineer_mohamed_adel991/
‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎‎
╭───────────────────────╮
        الأوامــــــر : menu
╰───────────────────────╯
╭───────────────────────╮
|  ⸙ .menuv مشاهده فيديو البوت
|-----------------------
|          الاضافات
|-----------------------
│  ⸙ .tk2   التحميل من تيكتوك
│  ⸙ .apkmody   التحميل من apkmody(تطبيقات مهكرة) 
│  ⸙ .tk2audio   تحميل صوت التيكتوك 
│  ⸙ .tk2mp3   تحميل اغنيه التيكتوك  
|  ⸙ .sc   التحميل من الساوند كلاود
|  ⸙ .songyt   تحميل (الاغاني) من اليوتيوب
|-----------------------
│  ⸙ .sticker      صناعة ملصقات
│  ⸙ .apk         تحميل تطبيقات
│  ⸙ .fb      التحميل من فيسبوك
│  ⸙ .ig   التحميل من الانستغرام
│  ⸙ .tiktok  التحميل من تيكتوك
│  ⸙ .yt       التحميل من يوتوب
│  ⸙ .yts      البحث في اليوتوب
│  ⸙ .mediafire       ميديافاير
│  ⸙ .stickget      حقوق الملصق
│  ⸙ .alive  هل البوت شغال ام لا
│  ⸙ .song       تحميل الموسيقى 
╰───────────────────────╯
     BY Mohamed Adel`
                await conn.sendMessage(from, { text: msg11 }, { quoted: mek })

                break // _ _ _ _ _ _ _ _ __  _ _ _ _ _ _  __  _ _ _ __ _  __ _  _ _ _ _ __ _ _  __  __ _  _ __  _ __ _ _ _  _ __ _  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ __  __ _  __ _ _ _ _   //   		      
            case 'shahoda':
                const msg9 = `لطالما احبكي محمد يا عزيزيتي لكنك لم تنتبهي لذلك اتمنى منكما ان تصلحا قلوب بعضكما
                تحياتي محمد`
                await conn.sendMessage(from, { text: msg9 }, { quoted: mek })
                break
            case 'yara':
                const msg10 = `لطالما احبكي محمد يا عزيزيتي لكنك لم تنتبهي لذلك اتمنى منكما ان تصلحا قلوب بعضكما
                    تحياتي محمد`
                await conn.sendMessage(from, { text: msg10 }, { quoted: mek })
                break
            case 'owner':
                const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
                    +
                    'VERSION:3.0\n' +
                    `FN:` + 'Mohamed BEK' + `\n` // full name
                    +
                    'TEL;type=CELL;type=VOICE;waid=' + '201156831816' + ':+' + '201156831816' + '\n' // WhatsApp ID + phone number
                    +
                    'END:VCARD'
                await conn.sendMessage(from, { contacts: { displayName: 'HETLAR BEK', contacts: [{ vcard }] } }, { quoted: mek });
                break
                //_______________________________________________________________________________________________________________________________________________________   //		      

        }

    } catch (e) {
        const isError = String(e)
        console.log(isError)
    }


}

module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
module.exports = cmd
