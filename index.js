const puppeteer = require('puppeteer');
let x = false;
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: 'userData'
    })
    const page = await browser.newPage()
    doProcess(page);
    

}
     
)()

async function doProcess(page) {

  const fs = require("fs");
        // await page.goto('https://stackoverflow.com/users/login?ssrc=head&returnurl=https%3a%2f%2fstackoverflow.com%2fnocaptcha')
        // await page.type('#email', 'pict.assistant@gmail.com')
        // await page.type('#password', 'pict.assistant##')
        // await page.click('#submit-button')
        // await page.waitForNavigation()

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
        const lastAccessTimeFile = 'utils/lastAccessTime';
        let delimDateTime = new Date(fs.readFileSync(lastAccessTimeFile));

        //update lastAccessTime
        let lastAccess = datearray[0];
        fs.writeFileSync(lastAccessTimeFile,lastAccess);

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
                let addActionsOnGoogle = true;
                let anyEditsMade = false;
                await page.evaluate(() => {
                    let elements = Array.from(document.querySelectorAll('.s-tag'));
                    console.log(elements);
                    for (var i = 0; i < elements.length; i++) {

                        if (elements[i].innerText === 'actions-on-google') {
                            addActionsOnGoogle = false;
                        }
                        if (elements[i].innerText === 'google-assistant-sdk'||elements[i].innerText === 'dialogflow-fulfillment' || elements[i].innerText === 'chatbot' || elements[i].innerText === 'api-ai') {
                            elements[i].getElementsByClassName('js-delete-tag')[0].click();
                            anyEditsMade = true;
                        }
                    }
                    
                });
             /*   if (addActionsOnGoogle) {
                    // document.querySelector('#tageditor-replacing-tagnames--input').value = 'actions-on-google';
                    // anyEditsMade = true;
                    await page.type('#tageditor-replacing-tagnames--input', 'actions-on-google');
                    await page.waitForSelector('.match');
                    await page.click('.match');
                    anyEditsMade = true;
                                
                }
            */
                
                if (anyEditsMade) {
                    //TODO: randomize comments here
                    await page.type('#edit-comment', 'removed unneccesary tags');
                    await page.click('#submit-button');
                    try{
                        await page.waitForSelector('.post-text > blockquote:nth-child(1)',{ timeout: 5000 });
                    }catch(err){
                        console.log("Not edited");
                    }
                }
            }
        }
        await page.waitFor(50000);
        console.log('will run again');
        doProcess(page);
}