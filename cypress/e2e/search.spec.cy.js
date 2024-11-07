describe('Search API', () => {
    const baseUrl = 'http://localhost:3003/search'
    // const baseUrl = 'https://billboard-api.dev.ucconnect.co.th/search'

    const makeRequest = (method, url, qs = {}, body = {}) => {
        const options = {
            method,
            url: `${baseUrl}${url}`,
            qs,
            headers: {
                'Content-Type': 'application/json',
                'Authorization':
                    'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ3M2ZkMGE0LTIzMzctNGU1Yy1iYmQxLWE0NzZkNmQ3YjQzOSIsIm5hbWUiOiJrbm90IiwicGljdHVyZSI6bnVsbCwiZW1haWwiOm51bGwsImlzQ29uc2VudEFjY2VwdGVkIjp0cnVlLCJzZXR0aW5nIjp7InNob3dQcm9maWxlIjp0cnVlLCJzaG93TmFtZSI6dHJ1ZX0sImlhdCI6MTczMDk3NDk3MywiZXhwIjoxNzMwOTc4NTczLCJqdGkiOiIxODU3MzZiMS04OWRiLTRkNWQtYTViYi1mZjg0YTM2Y2FmMjAifQ.cBfxMu3kpnwxNJUZivdpdfZc4066Afd7AHXxpwsPkANLCjZwnT7Dj-7lwBf_b-RDQzg7-7-63WmIIVR2fru6D-fGGIT2sw1lC-U7aru7ulmwDvOeMUEagSGKIRcdR8MKgjIPkaGRN8VLUOlogG-sidU5dty3Ceb9cz9SriAVp2f9_DHWPxHBA5nSv_Vvillhf3hcM4CPNL0WGR0gyleT-L9fWmoiNFhzOj_du0KVq1cLbWwF1DPBMOisUnQG74o-erBFe1m-ps5pBQqs7WqX9ReOMYs7oMXv871ezFuDIfUdKJeQhjvCZbv0k8ulMluCNzOOukn-Z6LtBM1aGkBCog',
            },
        }

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            options.body = body
        }

        return cy.request(options)
    }

    const validateResponse = (response, status = 200, withData = true) => {
        expect(response.status).to.eq(status)

        if (withData) expect(response.body).to.have.property('data')
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
            validateResponse(response, 200, false)
            const album = response.body
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
            validateResponse(response, 200, false)
            const artist = response.body
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
            expect(response.status).to.eq(200)
        })
    })
})
