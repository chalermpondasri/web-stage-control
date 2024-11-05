describe('Search API', () => {
    const baseUrl = 'http://localhost:3003/search'
    // const baseUrl = 'https://billboard-api.dev.ucconnect.co.th/search'

    const makeRequest = (method, url, qs = {}) => {
        return cy.request({
            method,
            url: `${baseUrl}${url}`,
            qs,
        })
    }

    const validateResponse = (response, status = 200) => {
        expect(response.status).to.eq(status)
        expect(response.body).to.have.property('data')
    }

    const validateItems = (items, properties) => {
        items.forEach((item) => {
            properties.forEach((property) => {
                expect(item).to.have.property(property)
            })
        })
    }

    it('should search track by thai keyword', () => {
        makeRequest('GET', '/track', { keyword: 'เกาะ', page: 1, limit: 10 }).then((response) => {
            validateResponse(response)
            const { data } = response.body
            validateItems(data, [
                'id',
                'name',
                'type',
            ])
            expect(data.length).to.be.greaterThan(0)
            expect(data[0].name).to.include('เกาะ')
        })
    })

    it('should search track by english keyword', () => {
        makeRequest('GET', '/track', { keyword: 'galaxy', page: 1, limit: 10 }).then((response) => {
            validateResponse(response)
            const { data } = response.body
            validateItems(data, [
                'id',
                'name',
                'type',
            ])
            expect(data.length).to.be.greaterThan(0)
            expect(data[0].name.toLowerCase()).to.include('galaxy')
        })
    })

    it('should get top artist', () => {
        makeRequest('GET', '/artist/top').then((response) => {
            validateResponse(response)
            validateItems(response.body.data, [
                'id',
                'name',
                'type',
            ])
        })
    })

    it('should get new tracks', () => {
        makeRequest('GET', '/track/new').then((response) => {
            validateResponse(response)
            response.body.data.forEach((track) => {
                validateItems(
                    [
                        track,
                    ],
                    [
                        'id',
                        'name',
                        'type',
                        'artists',
                    ],
                )
                track.artists.forEach((artist) => {
                    validateItems(
                        [
                            artist,
                        ],
                        [
                            'name',
                            'type',
                        ],
                    )
                })
                if (track.album) {
                    validateItems(
                        [
                            track.album,
                        ],
                        [
                            'name',
                            'type',
                        ],
                    )
                }
            })
        })
    })

    it('should get top tracks', () => {
        makeRequest('GET', '/track/top').then((response) => {
            validateResponse(response)
            response.body.data.forEach((track) => {
                validateItems(
                    [
                        track,
                    ],
                    [
                        'id',
                        'name',
                        'type',
                        'artists',
                    ],
                )
                track.artists.forEach((artist) => {
                    validateItems(
                        [
                            artist,
                        ],
                        [
                            'name',
                            'type',
                        ],
                    )
                })
                if (track.album) {
                    validateItems(
                        [
                            track.album,
                        ],
                        [
                            'name',
                            'type',
                        ],
                    )
                }
            })
        })
    })

    it('should get top albums', () => {
        makeRequest('GET', '/album/top').then((response) => {
            validateResponse(response)
            validateItems(response.body.data, [
                'id',
                'name',
                'type',
            ])
        })
    })

    it('should get album by id', () => {
        makeRequest('GET', '/album/100').then((response) => {
            validateResponse(response)
            const album = response.body.data
            validateItems(
                [
                    album,
                ],
                [
                    'id',
                    'name',
                    'tracks',
                    'type',
                ],
            )
            album.tracks.forEach((track) => {
                validateItems(
                    [
                        track,
                    ],
                    [
                        'id',
                        'name',
                        'artists',
                        'type',
                    ],
                )
                track.artists.forEach((artist) => {
                    validateItems(
                        [
                            artist,
                        ],
                        [
                            'name',
                            'type',
                        ],
                    )
                })
            })
        })
    })

    it('should get artist by id', () => {
        makeRequest('GET', '/artist/100').then((response) => {
            validateResponse(response)
            const artist = response.body.data
            validateItems(
                [
                    artist,
                ],
                [
                    'id',
                    'name',
                    'tracks',
                    'type',
                ],
            )
            artist.tracks.forEach((track) => {
                validateItems(
                    [
                        track,
                    ],
                    [
                        'id',
                        'name',
                        'type',
                    ],
                )
            })
        })
    })

    it('should add hitCounts to track', () => {
        makeRequest('GET', '/track/100/hit').then((response) => {
            validateResponse(response)
        })
    })
})
