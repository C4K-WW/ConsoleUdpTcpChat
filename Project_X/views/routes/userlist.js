module.exports = function(app, buff, result) {
    function removeDub(username) {
        let i = 0;
        while (i < result.length) {
            if (username === result[i].name) {
                buff.add(`${username}\n`);
            }
            i++;
        };
    };

    app.get('/users', (req, res) => {
        if (typeof(req.user) === "object") {
            removeDub(req.user.name);
            let names = Array.from(buff);
            res.json(names);
        } else if (typeof(req.user) === "undefined") {
            let resp = new Array('empty');
            res.json(resp);
        }
    });
};