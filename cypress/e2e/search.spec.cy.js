describe('Search API', () => {
    const baseUrl = 'http://localhost:3003/search'
    // const baseUrl = 'https://billboard-api.dev.ucconnect.co.th/search'

    console.log(Cypress.env('DB_NAME'))

    it('should search track by thai keyword', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/track`,
            qs: {
                keyword: 'เกาะ',
                page: 1,
                limit: 10,
            },
        }).then((response) => {
            const { data } = response.body
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            data.forEach((item) => {
                expect(item).to.have.property('id')
                expect(item).to.have.property('name')
                expect(item).to.have.property('type')
            })

            expect(data.length).to.be.greaterThan(0)
            expect(data[0].name).to.include('เกาะ')
        })
    })

    it('should search track by english keyword', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/track`,
            qs: {
                keyword: 'galaxy',
                page: 1,
                limit: 10,
            },
        }).then((response) => {
            const { data } = response.body
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            data.forEach((item) => {
                expect(item).to.have.property('id')
                expect(item).to.have.property('name')
                expect(item).to.have.property('type')
            })

            expect(data.length).to.be.greaterThan(0)
            expect(data[0].name.toLowerCase()).to.include('galaxy')
        })
    })

    it('should get top artist', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/artist/top`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            response.body.data.forEach((artist) => {
                expect(artist).to.have.property('id')
                expect(artist).to.have.property('name')
                expect(artist).to.have.property('type')
            })
        })
    })

    it('should get new tracks', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/track/new`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            response.body.data.forEach((track) => {
                expect(track).to.have.property('id')
                expect(track).to.have.property('name')
                expect(track).to.have.property('type')
            })
        })
    })

    it('should get top tracks', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/track/top`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            response.body.data.forEach((track) => {
                expect(track).to.have.property('id')
                expect(track).to.have.property('name')
                expect(track).to.have.property('type')
            })
        })
    })

    it('should get top albums', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/album/top`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            response.body.data.forEach((album) => {
                expect(album).to.have.property('id')
                expect(album).to.have.property('name')
                expect(album).to.have.property('type')
            })
        })
    })

    it('should get album by id', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/album/100`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            const album = response.body.data
            expect(album).to.have.property('id', 100)
            expect(album).to.have.property('name')
            expect(album).to.have.property('tracks')
            expect(album).to.have.property('type')
            album.tracks.forEach((track) => {
                expect(track).to.have.property('id')
                expect(track).to.have.property('name')
                expect(track).to.have.property('artists')
                expect(track).to.have.property('type')
                track.artists.forEach((artist) => {
                    expect(artist).to.have.property('name')
                    expect(artist).to.have.property('type')
                })
            })
        })
    })

    it('should get artist by id', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/artist/100`,
        }).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('data')
            const artist = response.body.data
            expect(artist).to.have.property('id', 100)
            expect(artist).to.have.property('name')
            expect(artist).to.have.property('tracks')
            expect(artist).to.have.property('type')
            artist.tracks.forEach((track) => {
                expect(track).to.have.property('id')
                expect(track).to.have.property('name')
                expect(track).to.have.property('type')
            })
        })
    })

    it('should add hitCounts to track', () => {
        cy.request({
            method: 'GET',
            url: `${baseUrl}/track/100/hit`,
        }).then((response) => {
            expect(response.status).to.eq(200)
        })
    })
})
