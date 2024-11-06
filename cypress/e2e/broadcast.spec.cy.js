describe('Search API', () => {
    const baseUrl = 'http://localhost:3004/broadcast'

    const makeRequest = (method, url, qs = {}, body = {}) => {
        const options = {
            method,
            url: `${baseUrl}${url}`,
            qs,
        }

        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
            options.body = body
        }

        return cy.request(options)
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

    it('should get stickers', () => {
        makeRequest('GET', '/stickers').then((response) => {
            validateResponse(response)
            const { data } = response.body
            validateItems(data, [
                'id',
                'price',
                'isFree',
            ])
            expect(data.length).to.be.greaterThan(0)
        })
    })

    it('should create broadcast message and censor bad words', () => {
        makeRequest(
            'POST',
            '/message',
            {},
            {
                message: 'Hello World, damn it, สวัสดีไอ้บ้า',
                stickerId: 1,
                isShowProfileImage: true,
                isShowProfileName: true,
            },
        ).then((response) => {
            validateResponse(response, 201)
            expect(response.body.data).to.have.property('filteredMessage')
            expect(response.body.data.filteredMessage).to.not.include('damn')
            expect(response.body.data.filteredMessage).to.not.include('ไอ้')
        })
    })
})
