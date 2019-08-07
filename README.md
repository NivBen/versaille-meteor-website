This is a quick example of how you might layout your app in meteor 1.4.

/client/main.js -> this imports all the stuff the client (web browser)  needs including html , css and js

/server/main.js -> this imports all the stuff the server (node.js)  needs - mainly js

/imports/api -> stuff that server and client need
/imports/client -> stuff that only the client needs
/imports/server -> stuff that only the server needs

