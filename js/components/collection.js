module.exports = function(baseUrl) {
    return new Collection(baseUrl);
}

var Promise = require('bluebird'),
    _       = require('underscore'),
    url     = require('url');

Collection = function(baseUrl) {
    this.baseUrl = baseUrl;
}

Collection.prototype.resolvePagination = function(req, count) {
    return new Promise(function(resolve, reject) {
        var page    = req.query.page;
        var limit   = req.query.limit;

        if (!_.isNumber(page)) {
            page = 1;
        }
        if (!_.isNumber(limit)) {
            limit = 10;
        }

        limit = Math.max(limit, 1);
        var maxPage = Math.max(Math.ceil(count / limit), 1);
        page  = Math.min(Math.max(page, 1), maxPage);

        var pagination = {
            offset:     (page - 1) * limit,
            limit:      limit,
            page:       page,
            count:      count,
            lastPage:   Math.max(Math.ceil(count / limit), 1)
        };

        resolve(pagination);
    });
}

Collection.prototype.generateLinks = function(req, pagination, count) {
    var components = url.parse(req.protocol + '://' + req.get('host') + req.originalUrl, true);
    delete components.search;
    var queryObj   = components.query;

    var getLink = function(page) {
        var newQueryObj = _.extend(queryObj, {page: page, limit: pagination.limit});
        return url.format(_.extend(components, {query: newQueryObj}));
    }

    var links = {};
    links.first   = getLink(1);
    links.last    = getLink(pagination.lastPage);
    links.current = getLink(pagination.page);

    if (pagination.page > 1) {
        links.prev = getLink(pagination.page - 1);
    }
    if (pagination.page < pagination.lastPage) {
        links.next = getLink(pagination.page + 1);
    }

    return Promise.resolve(links);
}


Collection.prototype.returnCollection = function(req, res, dataPromise, countPromise) {
    var self = this;

    return countPromise()
            .then(function(count) {
                return self.resolvePagination(req, count);
            }).then(function(pagination) {
                return Promise.props({
                    count: pagination.count,
                    items: dataPromise(pagination),
                    links: self.generateLinks(req, pagination, pagination.count)
                })
            }).then(function(result) {
                return res.json(result);
            }).catch(function(e) {
                console.log(e.stack);
                res.status(400).json({error: e});
            });
}
