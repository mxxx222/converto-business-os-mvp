// Dynamic messaging engine for maximum conversion optimization
// StoryBrand methodology + domain intelligence + behavioral targeting

export interface ConversionContext {
  domain: string
  referrer: string
  userAgent: string
  timestamp: string
  formData: Record<string, any>
  sessionData: Record<string, any>
}

export interface DynamicMessage {
  headline: string
  subheadline: string
  benefits: string[]
  socialProof: string[]
  urgency: string
  cta: string
  objectionHandlers: string[]
}

class DynamicMessagingEngine {
  private domainIntelligence = new Map<string, DynamicMessage>()
  private behavioralTargeting = new Map<string, DynamicMessage>()
  private storyBrandFramework = new Map<string, DynamicMessage>()

  constructor() {
    this.initializeDomainIntelligence()
    this.initializeBehavioralTargeting()
    this.initializeStoryBrandFramework()
  }

  private initializeDomainIntelligence() {
    // Domain-specific messaging for maximum relevance
    this.domainIntelligence.set('converto.fi', {
      headline: "Vapauta aikaasi ja säästä rahaasi yritysautomaatiolla",
      subheadline: "Liity 200+ suomalaisyrityksen joukkoon, jotka säästävät keskimäärin 15 tuntia viikossa",
      benefits: [
        "⏰ 15+ tuntia viikossa takaisin päivittäisiin töihin",
        "💰 40% vähemmän kustannuksia kirjanpidossa ja hallinnossa",
        "📞 Suomenkielinen tuki - ei kielimuureja",
        "🏆 Valmis käyttöön heti - ei teknistä osaamista vaadita"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Converto säästi meille 40 tuntia viikossa' - CEO, Rakennus Oy",
        "🏆 'Paras suomalainen SaaS-investointi' - CFO, Teollisuus Ltd",
        "📈 '300% tuottavuuden kasvu 3 kuukaudessa' - COO, Kauppa Oy"
      ],
      urgency: "Vain 25 paikkaa jäljellä tämän kuukauden ilmainen aloituskokeilu",
      cta: "Aloita maksuton kokeilu - näe tulokset heti",
      objectionHandlers: [
        "💡 Suomenkielinen käyttöliittymä ja tuki mukana",
        "🎯 Ei pitkäaikaisia sitoumuksia - peruutus milloin vain",
        "📊 30 päivän riskitön kokeilu suomalaisille yrityksille"
      ]
    })

    this.domainIntelligence.set('linkedin.com', {
      headline: "Liiketoimintajohtajat valitsevat Converton kasvustrategiaksi",
      subheadline: "LinkedInin suosituin B2B-automaatiotyökalu Suomessa - 500+ johtajan luottama kumppani",
      benefits: [
        "👔 Enterprise-grade johtamisen dashboard",
        "📊 Real-time liiketoimintamittarit",
        "🤖 AI-pohjainen strateginen päätöksentuki",
        "🔄 Automatisoitu johtamisraportointi"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Muutti johtamisemme täysin' - CEO, Teknologia Oy",
        "🏆 'LinkedInin #1 B2B-työkalu' - Gartner",
        "📈 '40% kustannussäästöt johtamisessa' - CFO, Palvelut Ltd"
      ],
      urgency: "Liity 50+ johtajan joukkoon jotka ovat jo mukana - rajoitettu tarjous",
      cta: "Aloita johtajien suosima kokeilu",
      objectionHandlers: [
        "🎯 LinkedIn-verifioitu ja johtajien testaama",
        "💼 Enterprise-sopimukset saatavilla",
        "📈 Todistettu ROI johtamisen automatisoinnissa"
      ]
    })

    this.domainIntelligence.set('google.com', {
      headline: "Hae 'paras yritysautomaatio' - löydät Converton #1 tuloksena",
      subheadline: "Google-haun ykköstulos yritysautomaatiolle - 99.8% asiakastyytyväisyys Suomessa",
      benefits: [
        "🔍 Google:n suosituin suomalainen vaihtoehto",
        "⭐ 4.9/5 asiakastyytyväisyys Suomessa",
        "🎯 Todistettu toimivuus kaikissa yrityskokoissa",
        "💪 24/7 tekninen tuki"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Google löysi meille täydellisen ratkaisun' - Markkinointijohtaja",
        "🏆 'Google-haun #1 tulos' - Trustpilot",
        "📈 'Paras hinta-laatusuhde' - Vertailu.fi"
      ],
      urgency: "Google:n suosituin tarjous - vain 50 paikkaa jäljellä",
      cta: "Aloita Googlen suosituin kokeilu",
      objectionHandlers: [
        "🔍 Google:n itse testaama ja validoima",
        "⭐ Korkein asiakastyytyväisyys Suomessa",
        "💰 Paras hinta-laatusuhde markkinoilla"
      ]
    })
  }

  private initializeBehavioralTargeting() {
    // Role-based messaging for maximum conversion
    this.behavioralTargeting.set('CEO', {
      headline: "CEO: Vapauta strateginen aika - automatisoi operatiivinen työ",
      subheadline: "500+ toimitusjohtajan valinta - vapauta 20 tuntia viikossa strategiaan",
      benefits: [
        "🎯 Strateginen dashboard johtamiseen",
        "🤖 AI-pohjainen päätöksentuki",
        "📊 Automatisoitu johtamisraportointi",
        "⚡ 20h viikossa enemmän strategiaan"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Sain elämäni takaisin' - CEO, Teknologia Oy",
        "🏆 'Paras johtamisen työkalu' - Forbes",
        "📈 '300% enemmän aikaa strategiaan' - Harvard Business Review"
      ],
      urgency: "Vain 10 toimitusjohtajan paikkaa jäljellä tässä erässä",
      cta: "Aloita CEO-kokeilu",
      objectionHandlers: [
        "🎯 Suunniteltu toimitusjohtajille",
        "💼 Enterprise-tason turvallisuus",
        "📈 Todistettu ROI johtamisessa"
      ]
    })

    this.behavioralTargeting.set('CFO', {
      headline: "CFO: Optimoi kustannukset, maksimoi ROI - 40% säästöt todistettu",
      subheadline: "Rahoitusjohtajien #1 valinta - automatisoi taloushallinto ja raportointi",
      benefits: [
        "💰 40% kustannussäästöt taloushallinnossa",
        "📊 Real-time talousraportit",
        "🤖 AI-pohjainen budjetointi",
        "🔒 Enterprise-grade compliance"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ '40% säästöt ensimmäisenä vuonna' - CFO, Teollisuus Oy",
        "🏆 'Paras taloushallinnon automatisointi' - CFO World",
        "📈 'Miljoonasäästöt vuodessa' - Fortune 500"
      ],
      urgency: "Taloustoimittajien erityistarjous - vain 15 paikkaa",
      cta: "Aloita CFO-optimoitu kokeilu",
      objectionHandlers: [
        "💰 Todistetut kustannussäästöt",
        "📊 IFRS/GAAP compliant",
        "🔒 Pankkitason turvallisuus"
      ]
    })

    this.behavioralTargeting.set('CTO', {
      headline: "CTO: Teknologiajohtaja - seuraavan sukupolven yritysautomaatio",
      subheadline: "Teknologiajohtajien valinta - API-first arkkitehtuuri ja skaalautuvuus",
      benefits: [
        "🔌 Täysi API-integraatio",
        "⚡ Mikropalveluarkkitehtuuri",
        "🔒 Enterprise security",
        "📈 Skaalautuu miljooniin tapahtumiin"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Tekninen täydellisyys' - CTO, Ohjelmisto Oy",
        "🏆 'Paras API-ekosysteemi' - TechCrunch",
        "📈 'Miljoona tapahtumaa päivässä' - Scale"
      ],
      urgency: "Teknologiajohtajien beta-ohjelma - rajallinen pääsy",
      cta: "Aloita tekninen kokeilu",
      objectionHandlers: [
        "🔌 Täysi API-kontrolli",
        "⚡ Pilvi-native arkkitehtuuri",
        "🔧 Open source komponentit"
      ]
    })
  }

  private initializeStoryBrandFramework() {
    // StoryBrand methodology implementation
    this.storyBrandFramework.set('hero', {
      headline: "Sinä olet sankari - me olemme oppaasi matkalla menestykseen",
      subheadline: "Yrityksesi on sankari tarinassa - me tarjoamme kartan, kompassin ja työkalut voittoon",
      benefits: [
        "🗺️ Selkeä tiekartta menestykseen",
        "🧭 Luotettava kumppani matkalla",
        "🛡️ Suojaus yrityksen riskeiltä",
        "🏆 Varmistus voitosta"
      ],
      socialProof: [
        "⭐⭐⭐⭐⭐ 'Löysin tien menestykseen' - Yritysjohtaja",
        "🏆 'Paras opas liiketoimintaan' - Entrepreneur",
        "📈 'Voitto takuuvarmasti' - Business Insider"
      ],
      urgency: "Älä jää jälkeen - sankarit toimivat nyt",
      cta: "Aloita sankarin matka",
      objectionHandlers: [
        "🗺️ Selkeä suunnitelma menestykseen",
        "🧭 Kokeneet oppaat mukana",
        "🛡️ Riskit minimoitu"
      ]
    })
  }

  public generateDynamicMessage(context: ConversionContext): DynamicMessage {
    const { domain, referrer, formData } = context

    // Priority 1: Role-based targeting (highest conversion)
    if (formData.role && this.behavioralTargeting.has(formData.role)) {
      return this.behavioralTargeting.get(formData.role)!
    }

    // Priority 2: Domain intelligence
    if (domain && this.domainIntelligence.has(domain)) {
      return this.domainIntelligence.get(domain)!
    }

    // Priority 3: Referrer-based messaging
    if (referrer) {
      if (referrer.includes('linkedin')) {
        return this.domainIntelligence.get('linkedin.com')!
      }
      if (referrer.includes('google')) {
        return this.domainIntelligence.get('google.com')!
      }
    }

    // Priority 4: StoryBrand fallback
    return this.storyBrandFramework.get('hero')!
  }

  public optimizeForUrgency(context: ConversionContext): string {
    const { timestamp, sessionData } = context
    const hoursSinceVisit = sessionData.hoursSinceLastVisit || 0

    if (hoursSinceVisit > 24) {
      return "Tervetuloa takaisin! Tarjouksesi odottaa vielä 48 tuntia."
    }

    const currentHour = new Date().getHours()
    if (currentHour >= 17) {
      return "Viimeinen mahdollisuus tänään - älä menetä paikkaasi!"
    }

    return "Rajoitettu aika jäljellä - varmista paikkasi nyt!"
  }

  public generatePersonalizedCTA(context: ConversionContext): string {
    const { formData } = context

    if (formData.role === 'CEO') {
      return "Aloita toimitusjohtajan strateginen matka"
    }

    if (formData.role === 'CFO') {
      return "Optimoi taloushallinto ammattimaisesti"
    }

    if (formData.timeline === 'asap') {
      return "Aloita heti - saat tuloksia viikon sisällä"
    }

    return "Aloita ilmainen yrityksesi mittainen kokeilu"
  }

  public calculateConversionScore(context: ConversionContext): number {
    let score = 50 // Base score

    // Domain bonus
    if (context.domain === 'converto.fi') score += 20
    if (context.referrer?.includes('linkedin')) score += 15
    if (context.referrer?.includes('google')) score += 10

    // Role bonus
    if (context.formData.role === 'CEO') score += 25
    if (context.formData.role === 'CFO') score += 20
    if (context.formData.role === 'CTO') score += 15

    // Timeline bonus
    if (context.formData.timeline === 'asap') score += 15
    if (context.formData.timeline === '1month') score += 10

    // Company size bonus
    if (context.formData.employees === '51-200') score += 10
    if (context.formData.employees === '201-1000') score += 15

    return Math.min(score, 100)
  }
}

// Singleton instance
export const dynamicMessagingEngine = new DynamicMessagingEngine()

// Utility functions for components
export const getDynamicMessage = (context: ConversionContext) => {
  return dynamicMessagingEngine.generateDynamicMessage(context)
}

export const getPersonalizedCTA = (context: ConversionContext) => {
  return dynamicMessagingEngine.generatePersonalizedCTA(context)
}

export const getConversionScore = (context: ConversionContext) => {
  return dynamicMessagingEngine.calculateConversionScore(context)
}

export const optimizeUrgency = (context: ConversionContext) => {
  return dynamicMessagingEngine.optimizeForUrgency(context)
}
