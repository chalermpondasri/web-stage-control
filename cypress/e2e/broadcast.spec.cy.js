describe('Search API', () => {
    const baseUrl = 'http://localhost:3004/broadcast'

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
            validateResponse(response, 201, false)
            expect(response.body).to.have.property('filteredMessage')
            expect(response.body.filteredMessage).to.not.include('damn')
            expect(response.body.filteredMessage).to.not.include('ไอ้')
        })
    })
})
