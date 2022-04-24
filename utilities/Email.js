const nodemailer = require('nodemailer');

async function mail(userList, concert, author) {
    let emailHost = process.env.EMAIL_HOST;
    let emailPort = process.env.EMAIL_PORT;
    let emailUser = process.env.EMAIL_USER;
    let emailPass = process.env.EMAIL_PASS;

    let title = concert.title;
    let location = concert.location;
    let price = concert.price;
    let imageUrl = concert.image.url;
    let description = concert.description;

    let emailList = new Array();
    for (user in userList) {
        emailList.push(userList[user].email);
    }

    let transporter = nodemailer.createTransport({
        host:emailHost,
        port:emailPort,
        secure:true,
        auth: {
            user: emailUser,
            pass: emailPass,
        }
    });
    
    try {
        let info = await transporter.sendMail({
            from:'no-reply@myconcerts.programminghelp.org',
            bcc: emailList,
            subject:'New Concert',
            text:'New Concert Has Been Created!',
            html:`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf=8">
                <style>
                html, body, div, span,
                h1, h2, h3, h4, h5, h6, p, blockquote, pre,
                a, abbr, acronym, address, big, cite, code,
                del, dfn, em, img,
                b, u, i, center, ol, ul, li,
                fieldset, form, label,
                article, aside, details, footer, header, hgroup, 
                menu, nav, section {
                margin: 0;
                padding: 0;
                border: 0;
                font-size: 16px;
                font: inherit;
                vertical-align: baseline;
            }
                .announcement {
                    font-weight:bold;
                    font-size:32px;
                    text-align:center;
                    padding:16px 0;
                    color:#FFF;
                    background-color:#3949A0;
                }
                .bodyContainer {
                    background-color:#2B2B2B;
					
                }
                .leftContainer {
                    display:inline-block;
                    width:33%;
                    text-align:center;
					vertical-align:top;
                }
                .leftContainer > img {
                    max-height:480px;
                    max-width:100%;
                    vertical-align:top;
                    margin:0 auto;
                }
                .rightContainer {
                    display:inline-block;
                    width:65%;
					padding:1%;
                    color:#FFF;    				
                }
                .rightContainer > p:first-child {
                    font-weight:bold;
                }
                .rightContainer > p:not(:first-child) {
                    margin-top:16px;
                }
                .rightContainer > p:last-child {
                    margin-top:32px;
                }
                .footer > p {
                    text-align:center;
                    padding:16px 0;
                    color:#FFF;
                    background-color:#3949A0;
                }
                @media (max-width:1366px) {
                    .announcement {
                        font-size:24px;
                    }
                    .leftContainer {
                        width:100%;
                    }
                    .leftContainer > img {
                        max-height:240px;
                    }
                    .rightContainer {
                        width:98%;
                    }
                }
                @media (max-width:820px) {
                    .announcement {
                        font-size:20px;
                    }
                }
                </style>
            </head>
            <body>
                <h1 class="announcement">New Concert Has Been Created!</h1>
                <div class="bodyContainer">
					<div class="leftContainer">
						<img src="${imageUrl}" />
					</div><!--
					--><div class="rightContainer">
						<p>${title}</p>
                        <p>Creator: ${author}</p>
                        <p>Price: &#36;${price} per person</p>
                        <p>Location: ${location}</p>
                        <p>${description}</p>
					</div>
				</div>
				<div class="footer"><!--
                    --><p>&copy; MyConcerts 2022</p><!--
                --></div>
            </body>
            </html>`,
        });
    }
    catch(e) {
        console.log(e);
    }
}

module.exports = mail;