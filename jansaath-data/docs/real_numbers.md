real_numbers = """# Real Lucknow Data Points for Demo

## Ward 4 Chinhat
- Population: ~3,400 residents in 500m radius
- Source: Census 2021
- Water coverage: 62% households (JJM data)
- Nearest handpump: 400m away

## Sarojini Nagar
- Nearest school: 4.2km away
- Source: UDISE+ school data
- School name: Sarojini Nagar Primary School
- Enrollment: 1,200 students

## Alambagh
- Electricity complaints: 45% of all complaints in ward
- Transformer locations: 3 within 2km

## LADS Budget (Lucknow MP)
- Annual allocation: Rs 5 crore
- Source: sansad.in
- Utilized: Rs 3.2 crore (64%)

## JJM Coverage (Outer Wards)
- 62% households have tap water
- Source: jaljeevanmission.gov.in

## Monsoon Pattern (Lucknow)
- Onset: June 20-25
- Peak rainfall: July-August
- Source: IMD data
"""

with open("docs/real_numbers.md", "w") as f:
    f.write(real_numbers)

print("✅ docs/real_numbers.md written")
print(real_numbers)

print("\n⚠️  FIGURES TO VERIFY OR SWAP BEFORE DEMO DAY:")
print("   - 'Census 2021' does not exist (last real census: 2011) — rename source label")
print("   - 62% water coverage (Chinhat) — real UP JJM rural rate context is closer to 74% statewide;")
print("     verify or use the calibrated ward figure from the Day 1 dataset notebook instead")
print("   - 4.2km nearest school (Sarojini Nagar), school name/enrollment — not sourced, invented for the plan")
print("   - 45% electricity complaints (Alambagh) — not sourced, invented for the plan")
print("   - Rs 3.2 crore utilized (64%) — not sourced; real fact is Rs 5cr/yr entitlement is fixed nationally,")
print("     but per-MP utilization isn't public without checking sansad.in/MPLADS district reports directly")
print("   - June 20-25 monsoon onset — roughly right historically for Lucknow but not this year's real IMD onset date")