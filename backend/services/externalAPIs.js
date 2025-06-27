// External API service for Design Tools
const axios = require('axios');

class ExternalAPIService {
  constructor() {
    this.unsplashAPI = process.env.UNSPLASH_ACCESS_KEY;
    this.pantoneAPI = process.env.PANTONE_API_KEY;
    this.googleFontsAPI = process.env.GOOGLE_FONTS_API_KEY;
  }

  // Unsplash API for moodboard images
  async searchImages(query, page = 1, perPage = 20) {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          page,
          per_page: perPage,
          orientation: 'all'
        },
        headers: {
          'Authorization': `Client-ID ${this.unsplashAPI}`
        }
      });
      
      return {
        success: true,
        data: response.data.results.map(img => ({
          id: img.id,
          url: img.urls.regular,
          thumbnail: img.urls.thumb,
          description: img.description || img.alt_description,
          photographer: img.user.name,
          downloadUrl: img.links.download_location
        }))
      };
    } catch (error) {
      console.error('Unsplash API error:', error);
      return { success: false, error: error.message };
    }
  }

  // Color palette generation
  async generateColorPalette(baseColor) {
    try {
      const response = await axios.get(`https://www.thecolorapi.com/scheme`, {
        params: {
          hex: baseColor.replace('#', ''),
          mode: 'analogic',
          count: 5
        }
      });

      return {
        success: true,
        data: response.data.colors.map(color => ({
          hex: color.hex.value,
          name: color.name.value,
          rgb: color.rgb.value,
          hsl: color.hsl.value
        }))
      };
    } catch (error) {
      console.error('Color API error:', error);
      return { success: false, error: error.message };
    }
  }

  // Google Fonts API
  async getFonts(category = 'sans-serif') {
    try {
      const response = await axios.get('https://www.googleapis.com/webfonts/v1/webfonts', {
        params: {
          key: this.googleFontsAPI,
          sort: 'popularity',
          category: category
        }
      });

      return {
        success: true,
        data: response.data.items.slice(0, 50).map(font => ({
          family: font.family,
          category: font.category,
          variants: font.variants,
          subsets: font.subsets,
          files: font.files
        }))
      };
    } catch (error) {
      console.error('Google Fonts API error:', error);
      return { success: false, error: error.message };
    }
  }

  // Pantone Color Matching (Premium API)
  async matchPantoneColor(hexColor) {
    if (!this.pantoneAPI) {
      return { success: false, error: 'Pantone API key not configured' };
    }

    try {
      // This would be the actual Pantone API call
      // Note: Pantone API requires special licensing
      const response = await axios.post('https://api.pantone.com/v1/colors/match', {
        color: hexColor,
        format: 'hex'
      }, {
        headers: {
          'Authorization': `Bearer ${this.pantoneAPI}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          pantoneCode: response.data.pantone_code,
          name: response.data.name,
          hex: response.data.hex,
          rgb: response.data.rgb,
          cmyk: response.data.cmyk
        }
      };
    } catch (error) {
      console.error('Pantone API error:', error);
      return { success: false, error: error.message };
    }
  }

  // Fabric supplier integration (example)
  async searchFabrics(query, filters = {}) {
    try {
      // This would integrate with actual fabric supplier APIs
      // For now, return mock data with API structure
      return {
        success: true,
        data: {
          fabrics: [
            {
              id: 'fabric_001',
              name: `${query} Cotton Blend`,
              supplier: 'Premium Textiles Co.',
              composition: '60% Cotton, 40% Polyester',
              weight: '180 GSM',
              width: '150cm',
              price: {
                amount: 12.50,
                currency: 'USD',
                unit: 'meter'
              },
              sustainability: {
                organic: true,
                recycled: false,
                certifications: ['GOTS', 'OEKO-TEX']
              },
              availability: 'In Stock',
              leadTime: '3-5 days',
              minimumOrder: 10
            }
          ],
          pagination: {
            page: 1,
            totalPages: 5,
            totalItems: 48
          }
        }
      };
    } catch (error) {
      console.error('Fabric API error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ExternalAPIService(); 