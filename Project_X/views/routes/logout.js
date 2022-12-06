module.exports = function(app, buff) {
    function logout(req, res) {
        for (key of buff) {
            if (req.user.name === key.trim()) {
                buff.delete(key);
                req.session.destroy();
            }
        };
        req.logOut();
    };
    app.post('/logout', (req, res) => {
        logout(req, res);
        res.end();
    });
};