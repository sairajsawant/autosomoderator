const cookiesFilePath = 'utils/loginCookie.json';  
const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()

    const fs = require("fs");

    if (fs.existsSync(cookiesFilePath)) {
        // If file exist load the cookies
        let content = fs.readFileSync(cookiesFilePath);
        const cookiesArr = JSON.parse(content);
        if (cookiesArr.length !== 0) {
            for (let a = 0; a < cookiesArr.length;a++) {
                console.log(cookiesArr[a]);
                await page.setCookie(cookiesArr[a]);
            }
            console.log('Session has been loaded in the browser')
            await page.goto('https://stackoverflow.com/')
            return true
        }
    } else {
        await page.goto('https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2fnocaptcha')
        await page.type('#email', 'pict.assistant@gmail.com')
        await page.type('#password', 'pict.assistant##')
        await page.click('#submit-button')
        await page.waitForNavigation()

        //  // Save Session Cookies
        // TODO: save and load cookies
        // const cookiesObject = await page.cookies()
        // const jsonfile = require('jsonfile')
        // // Write cookies to temp file to be used in other profile pages
        // jsonfile.writeFile(cookiesFilePath, cookiesObject, {
        //         spaces: 2
        //     },
        //     function (err) {
        //         if (err) {
        //             console.log('The file could not be written.', err)
        //         }
        //         console.log('Session has been successfully saved')
        //     })
        await page.goto('https://stackoverflow.com/questions/tagged/dialogflow')
        await page.waitForSelector('.user-action-time > span');
        let linkarray = await page.evaluate(() => {
            let elements = Array.from(document.querySelectorAll('.t-dialogflow'));
            let links = elements.map(element => {
                return element.parentNode.children[0].children[0].href
            })
            return links;
        });
        let datearray = await page.evaluate(() => {
            let elements = Array.from(document.querySelectorAll('.user-action-time > span'));
            let dates = elements.map(element => {
                return (element.title)
            })
            return dates;
        });
        let delimDateTime = new Date(fs.readFileSync('utils/lastAccessTime'));

        //update lastAccessTime
        let lastAccess = datearray[0];
        fs.writeFileSync('utils/lastAccessTime',lastAccess);

        for (let index = 0; index < linkarray.length && ((new Date(datearray[index])) > delimDateTime); index++) {
            console.log(datearray[index]);
            await page.goto(linkarray[index]);
            await page.waitForSelector('.post-menu > a:nth-child(3)');
            let editlink = await page.evaluate(() => {
                return document.querySelector('.post-menu > a:nth-child(3)').href;
            })
            if (editlink !== linkarray[index] + '#') {
                //no pending edit 
                await page.goto(editlink);
                await page.waitForSelector('.s-tag');
                await page.evaluate(() => {
                    let elements = Array.from(document.querySelectorAll('.s-tag'));
                    console.log(elements);
                    let addActionsOnGoogle = true;
                    let anyEditsMade = false;
                    for (var i = 0; i < elements.length; i++) {

                        if (elements[i].innerText === 'actions-on-google') {
                            addActionsOnGoogle = false;
                        }
                        if (elements[i].innerText === 'dialogflow-fulfillment' || elements[i].innerText === 'twilio' || elements[i].innerText === 'api-ai') {
                            elements[i].getElementsByClassName('js-delete-tag')[0].click();
                            anyEditsMade = true;
                        }
                    }
                    if (addActionsOnGoogle) {
                        document.querySelector('#tageditor-replacing-tagnames--input').value = 'actions-on-google';
                        anyEditsMade = true;
                    }
                    
                    if (anyEditsMade) {
                        //TODO: randomize comments here
                        document.querySelector('#edit-comment').value = "removed unneccesary tags";
                        //document.querySelector('#submit-button').click();
                    }

                });
            }
        }
    }
})()