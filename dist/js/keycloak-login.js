// keycloak object, these details we picked from the JSON downloaded file.
var keycloakObject = {
    "realm": "arms",
    "url": "http://www.a-rms.net:8585/auth/",
    "clientId": "Java-Service-Tree-Framework-aRMS-Client-Web"
};

// now we making connection of keycloak using above object
var keycloak = Keycloak(keycloakObject );

// authentication
keycloak.init({onLoad: 'login-required'}).success(function(authenticated) {
    // console.log(authenticated ? 'authenticated' : 'not authenticated');
    if(authenticated){
        console.log("authenticated keycloak ");
    }
    else{
        console.log(" not authenticated keycloak");
    }
}).error(function() {
    console.log('failed to initialize');
});



// token session timeout
setTimeout(function(){
    keycloak.updateToken(20).success(function(refreshed){
        if (refreshed) {
            console.debug('Token refreshed' + refreshed);
        } else {
            console.warn('Token not refreshed, valid for '
                + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
        }
    }).catch(() => {
        console.error('Failed to refresh token');
        keycloak.logout();
    });
}, 30000);
