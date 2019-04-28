const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()

    const cookiesFilePath = './loginCookiez.json';
    const fs = require("fs"); 
    
    if (fs.existsSync(cookiesFilePath)) {
        // If file exist load the cookies
        const cookiesArr = require(`.${cookiesFilePath}`)
        if (cookiesArr.length !== 0) {
            for (let cookie of cookiesArr) {
                console.log(cookie);
                
                await page.setCookie(cookie)
            }
            console.log('Session has been loaded in the browser')
            await page.goto('https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2fnocaptcha')
            return true
        }
    } else {
        await page.goto('https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2fnocaptcha')
        await page.type('#email', 'pict.assistant@gmail.com')
        await page.type('#password', 'pict.assistant##')
        await page.click('#submit-button')
        await page.waitForNavigation()
      
        //  // Save Session Cookies
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
        let linkarray = await page.evaluate(() => {
            let elements = Array.from(document.querySelectorAll('.t-dialogflow-fulfillment'));
            let links = elements.map(element => {
                return element.parentNode.children[0].children[0].href
            })
            return links;
        } );
        for (let index = 0; index < linkarray.length; index++) {
            await page.goto(linkarray[index]);
            await page.waitForNavigation();
        } 
    }
})()