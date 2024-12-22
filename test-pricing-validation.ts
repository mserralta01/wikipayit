import { pricingSchema } from './src/components/admin/lead/PricingSection'

const testCases = [
  // Test tier pricing
  {
    type: "tier",
    tiers: [
      { volume: 0, rate: 0 },  // Should fail: rate too low
      { volume: 1000, rate: 2.5 }
    ],
    transactionFee: 0.5
  },
  {
    type: "tier",
    tiers: [
      { volume: 1000, rate: 2.5 },
      { volume: 500, rate: 2.0 }  // Should fail: volumes not increasing
    ],
    transactionFee: 0.5
  },
  // Test interchange pricing
  {
    type: "interchange",
    interchangeMarkup: 20,  // Should fail: markup too high
    transactionFee: 0.5
  },
  // Test flat rate
  {
    type: "flat",
    flatRate: 6,  // Should fail: rate too high
    transactionFee: 0.5
  },
  // Test surcharge
  {
    type: "surcharge",
    surchargeRate: 0.5,  // Should fail: rate too low
    transactionFee: 0.5
  },
  // Test valid cases
  {
    type: "tier",
    tiers: [
      { volume: 1000, rate: 2.5 },
      { volume: 2000, rate: 2.0 }
    ],
    transactionFee: 0.5
  },
  {
    type: "interchange",
    interchangeMarkup: 10,
    transactionFee: 0.5
  },
  {
    type: "flat",
    flatRate: 3,
    transactionFee: 0.5
  },
  {
    type: "surcharge",
    surchargeRate: 2,
    transactionFee: 0.5
  }
]

testCases.forEach((testCase, index) => {
  console.log(`Testing case ${index + 1}:`)
  try {
    const result = pricingSchema.parse(testCase)
    console.log('✅ Validation passed:', result)
  } catch (error) {
    console.log('❌ Validation failed:', error.errors)
  }
  console.log('---')
})
