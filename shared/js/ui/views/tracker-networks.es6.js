const ParentSlidingSubview = require('./sliding-subview.es6.js')
const heroTemplate = require('./../templates/shared/hero.es6.js')
const CompanyListModel = require('./../models/site-company-list.es6.js')
const SiteModel = require('./../models/site.es6.js')
const { heroIcon } = require('../templates/shared/tracker-networks-text.es6')

function TrackerNetworks (ops) {
    // model data is async
    this.model = null
    this.currentModelName = null
    this.currentSiteModelName = null
    this.template = ops.template
    ParentSlidingSubview.call(this, ops)

    setTimeout(() => this._rerender(), 750)
    this.renderAsyncContent()
}

TrackerNetworks.prototype = window.$.extend({},
    ParentSlidingSubview.prototype,
    {

        setup: function () {
            this._cacheElems('.js-tracker-networks', [
                'hero',
                'details'
            ])

            // site rating arrives async
            this.bindEvents([[
                this.store.subscribe,
                `change:${this.currentSiteModelName}`,
                this._rerender
            ]])
        },

        renderAsyncContent: function () {
            const random = Math.round(Math.random() * 100000)
            this.currentModelName = 'siteCompanyList' + random
            this.currentSiteModelName = 'site' + random

            this.model = new CompanyListModel({
                modelName: this.currentModelName
            })
            this.model.fetchAsyncData().then(() => {
                this.model.site = new SiteModel({
                    modelName: this.currentSiteModelName
                })
                this.model.site.getBackgroundTabData().then(() => {
                    const content = this.template()
                    this.$el.append(content)
                    this.setup()
                    this.setupClose()
                })
            })
        },

        _renderHeroTemplate: function () {
            if (this.model.site) {
                const trackerNetworksIconName = 'major-networks-' + heroIcon(this.model.site)

                this.$hero.html(heroTemplate({
                    status: trackerNetworksIconName,
                    title: this.model.site.domain,
                    subtitle: '',
                    showClose: true
                }))
            }
        },

        _rerender: function (e) {
            if (e && e.change) {
                if (e.change.attribute === 'isaMajorTrackingNetwork' ||
                    e.change.attribute === 'isAllowlisted' ||
                    e.change.attribute === 'siteRating') {
                    this._renderHeroTemplate()
                    this.unbindEvents()
                    this.setup()
                    this.setupClose()
                }
            }
        }
    }
)

module.exports = TrackerNetworks
