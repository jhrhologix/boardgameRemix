# BoardGameGeek XML API Compliance

This document outlines how remix.games complies with the [BGG XML API Terms of Use](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use).

## ✅ Compliance Checklist

### Required Elements
- [x] **"Powered by BGG" Logo**: Displayed prominently in footer with link back to BGG
- [x] **Non-Commercial Use**: App is used for educational/personal purposes only
- [x] **No Data Modification**: Game data and images displayed as-is from BGG
- [x] **Proper Attribution**: BGG credited by name as data source
- [x] **Terms Reference**: Link to BGG XML API Terms of Use provided

### Technical Implementation
- [x] **Rate Limiting**: 1-second minimum interval between API requests per game
- [x] **Proper Headers**: User-Agent identifies non-commercial educational use
- [x] **Caching**: 1-week cache to reduce server load on BGG
- [x] **Error Handling**: Graceful fallbacks when BGG API unavailable
- [x] **Timeout Protection**: 10-second timeout to prevent hanging requests

## 🔧 Implementation Details

### API Endpoint
- **Route**: `/api/bgg-image?gameId={bgg_id}`
- **Purpose**: Legal proxy for BGG game images through official XML API
- **Rate Limit**: 1 request per second per game ID
- **Cache**: 1 week browser cache

### Attribution Display
- **Footer Logo**: "Powered by BoardGameGeek" with link
- **Terms Link**: Direct link to BGG XML API Terms of Use
- **Usage Declaration**: "Non-commercial educational purposes"

### Data Usage
- **Game Information**: Names, years, BGG IDs, descriptions
- **Images**: Cover art and thumbnails from BGG CDN
- **No Modification**: All data displayed exactly as provided by BGG
- **No AI Training**: Data not used for AI/LLM training (prohibited by terms)

## 📋 Monitoring & Compliance

### Request Monitoring
- Rate limiting enforced at application level
- Request timing logged for compliance verification
- Error rates monitored to ensure server stability

### Terms Compliance
- Regular review of BGG Terms of Use for updates
- Immediate implementation of any required changes
- Documentation of all BGG data usage

## 🔄 Update Process

1. **Terms Changes**: Monitor BGG wiki for terms updates
2. **API Changes**: Update implementation as needed for BGG API changes
3. **Attribution Updates**: Implement any new attribution requirements
4. **Rate Limit Adjustments**: Modify limits if requested by BGG

## 📞 Contact

For questions about BGG API compliance:
- Review: [BGG XML API Terms of Use](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use)
- Contact: BGG through their official channels

---

**Last Updated**: September 2025  
**Compliance Status**: ✅ COMPLIANT  
**Next Review**: Quarterly or upon BGG terms update
