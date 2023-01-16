
# MGDPR

MGDPR is a simple JavaScript library which will help you being GDPR compliant. 
It shows a popup to user visitors in which they are able to allow or disallow certain cookies. It is fully responsive.
Very easy to setup for any developer.
Requires jQuery



## License

[MIT](https://choosealicense.com/licenses/mit/)


## Authors

- [@ThomasRambaud](https://www.github.com/ThomasRambaud)


## Installation

Include mgdpr.css and mgdpr.js in your project and include them in your pages. As shown in demo.html

Then call MGDPR.init() with your desired configuration. For example:

        MGDPR.init({
        excludedUrls: [
            '/fr/cookies/',
            '/en/cookies-policy/'
        ],
        display: 'overlay', // 'overlay' or 'sticky-bottom'
        nullIsEnabled: false,
        i18n: {
            title: 'Dear visitors,',
            text: 'Our website www.domain.tld uses cookies to enhance your experience and provide usage statistics. You can accept all cookies, or manage your preferences as you wish.<br>' +
                '<a href="/legals" target="_blank">Read more</a>',
            managePreferences: 'Manage preferences',
            managePreferencesTitle: 'Cookie Policy',
            managePreferencesText: 'This site uses cookies deposited by the website, or by third parties.<br>' +
                'This page allows you to determine your cookie preferences. For information, technical cookies are cookies necessary for the proper functioning of our site, used by the host for the technical management of the network. They allow you to use the main features of the site. They are essential to use the main functionalities of the site and therefore cannot be deactivated.',
            savePreferences: 'Save my preferences',
            refuseAll: 'Refuse all, but technical cookies',
            acceptAll: 'Accept all',
            acceptAllCookies: 'Accept all cookies',
            accept: 'Accept',
            allCookies: 'All cookies',
            readMore: 'Read more',
        },
        cookies: [
            {
                title: 'Mandatory cookies',
                text: 'Technical cookies are cookies necessary for the proper functioning of the site which allow you to appreciate its main features.',
                list: [
                    {
                        name: 'technical',
                        title: 'Technical cookies',
                        canToggle: false,
                        readMoreUrl: '/fr/cookies',
                        mention: 'Technical cookies cannot be deactivated as they are needed for the site to function'
                    }
                ]
            },
            {
                title: 'Third party cookies',
                list: [
                    {
                        name: 'youtube',
                        title: 'YouTube',
                        mention: 'Video sharing services enrich the site with multimedia content and increase its visibility. You will not be able to view videos on our site if you disable them.'
                    },
                    {
                        name: 'analytics',
                        title: 'Google Analytics',
                        mention: 'Is necessary for audience measurement. These cookies are used to generate statistics useful for improving the site.',
                        onEnabled: function(cookie){
                            const script = document.createElement('script');
                            const gtmId = 'G-XXXXXXXXX';

                            script.src = 'https://www.googletagmanager.com/gtag/js?id=' + gtmId;
                            document.head.append(script)

                            window.dataLayer = window.dataLayer || [];

                            function gtag(){dataLayer.push(arguments);}

                            gtag('js', new Date());
                            gtag('config', gtmId, { 'anonymize_ip': true });
                        }
                    }
                ]
            }
        ]
    });

You can also use it to conditionaly embed HTML code, depending if the user has the cookie enabled or not.

    <div class="mgdpr-if" data-cookie="youtube" data-code="YOUR HTML ENCODED CODE GOES HERE"><span class="mgdpr-if-text">You must allow the YouTube cookie to view the video. <a class="mgdpr-manage-preferences">Click here to change your preferences</a></span></div>

Here is an example for a YouTube video:

    <div class="mgdpr-if" data-cookie="youtube" data-code="&lt;iframe title=&quot;YouTube video player&quot; src=&quot;https://www.youtube.com/embed/C0DPdy98e4c&quot; width=&quot;560&quot; height=&quot;315&quot; frameborder=&quot;0&quot; allowfullscreen=&quot;allowfullscreen&quot;&gt;&lt;/iframe&gt;"><span class="mgdpr-if-text">You must allow the YouTube cookie to view the video. <a class="mgdpr-manage-preferences">Click here to change your preferences</a></span></div>

You can view that in the demo.html

On server side, you can check if a certain cookie is enabled by checking if a cookie named "mgdpr_<name of the cookie in your configuration>" is not empty.
For example in PHP:

    $is_youtube_enabled = !empty($_COOKIE['mgdpr_youtube']);