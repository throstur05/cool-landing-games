var e=`lecture_cdx3_01`,t=`Codex New Math 3 — Advanced Topics Lecture`,n=`Harmonic Light Constant · Complex Numbers · Logarithms · Standing Waves · Roots of Unity`,r=`Codex Universalis — Advanced Math Overview`,i=1,a=1,o=30,s=`This lecture covers the advanced Codex math topics: the Harmonic Light Constant HL=10^(1/12) and its properties; complex numbers and the geometry of the complex plane (with an honest note on the Codex reinterpretation of i); logarithms as the language of harmonic scaling; standing waves and the inverse square law; and roots of unity as the harmonic geometry of the complex plane. Every concept is grounded in verifiable mathematics with definite numerical answers.`,c=[{id:`cdx3_s1`,heading:`Section 1 — The Harmonic Light Constant: HL = 10^(1/12)`,body:`The Codex defines the Harmonic Light Constant as HL = 10^(1/12) ≈ 1.100694. This is the 12th root of ten — the number that, when multiplied by itself 12 times, gives exactly 10.

  HL^12 = (10^(1/12))^12 = 10^(12/12) = 10

This makes HL the base ratio of a 12-step harmonic scale spanning one decade (a factor of 10). Compare this to music's equal temperament scale, which uses 2^(1/12) ≈ 1.059463 — the 12th root of 2, spanning one octave (factor of 2).

The 12 HL steps and their values:
  HL^1  ≈ 1.1007   HL^2  ≈ 1.2115   HL^3  ≈ 1.3335
  HL^4  ≈ 1.4678   HL^5  ≈ 1.6155   HL^6  ≈ 1.7783 (= √10)
  HL^7  ≈ 1.9573   HL^8  ≈ 2.1544   HL^9  ≈ 2.3714
  HL^10 ≈ 2.6102   HL^11 ≈ 2.8718   HL^12 = 10.0000

The midpoint HL^6 = 10^(6/12) = 10^(1/2) = √10 ≈ 3.1623 — exactly the Codex Axiom XXIV value.

Logarithms are the natural language of HL. Taking log₁₀ of both sides of HL^n = 10^(n/12): log₁₀(HL^n) = n/12. So n = 12×log₁₀(value). To find which HL step corresponds to a given value, take its base-10 logarithm and multiply by 12.

In music, the 12 equal-temperament semitones span an octave (2×). The HL 12 steps span a decade (10×). The ratio between the two 12th roots is:
  HL / 2^(1/12) = 10^(1/12) / 2^(1/12) = (10/2)^(1/12) = 5^(1/12) ≈ 1.0405

This means the Codex harmonic step is about 4% wider than a musical semitone.`,key_points:[`HL = 10^(1/12) ≈ 1.100694. The 12th root of ten.`,`HL^12 = 10. Twelve steps span one decade (×10).`,`HL^6 = √10 ≈ 3.1623. The midpoint = Codex Axiom XXIV value.`,`Compare: music uses 2^(1/12) ≈ 1.059 for equal temperament (12 semitones per octave).`,`HL/2^(1/12) = 5^(1/12) ≈ 1.0405. HL step is ~4% wider than a semitone.`,`To find n for a given value: n = 12×log₁₀(value).`],formulas:[{label:`Harmonic Light Constant`,expression:`HL = 10^(1/12) ≈ 1.100694`,description:`The 12th root of ten.`},{label:`HL cycle closure`,expression:`HL^12 = 10`,description:`Twelve HL steps = one decade.`},{label:`HL midpoint`,expression:`HL^6 = 10^(1/2) = √10 ≈ 3.1623`,description:`Connects to Codex Axiom XXIV.`},{label:`HL vs music`,expression:`2^(1/12) ≈ 1.05946 (semitone) vs HL ≈ 1.10069 (harmonic step)`,description:`Both are 12-step scales, different ratios.`},{label:`HL inverse`,expression:`n = 12 × log₁₀(target)`,description:`Find which HL step corresponds to a target value.`}],worked_examples:[{title:`Compute HL^4 exactly`,steps:[`HL^4 = 10^(4/12) = 10^(1/3) = ∛10.`,`Numerically: ∛10 ≈ 2.1544.`,`Verify: 2.1544^3 ≈ 10.001 ≈ 10. ✓`]},{title:`Which HL step corresponds to 5.0?`,steps:[`n = 12×log₁₀(5) = 12×0.69897 ≈ 8.388.`,`So 5 is between HL^8 ≈ 2.154 and HL^9 ≈ 2.371... wait, let's recheck.`,`log₁₀(5)≈0.69897. 12×0.699≈8.39. So HL^8.39≈5.`,`Verify: 10^(8.39/12)=10^0.699≈5. ✓`]}]},{id:`cdx3_s2`,heading:`Section 2 — Complex Numbers: The Geometry of i`,body:`The Codex reframes the imaginary unit i as 'the reciprocal of √10', collapsing the complex plane into a real harmonic geometry. Here is the honest mathematical situation, and then the Codex interpretation.

Standard mathematics: i is defined by i² = −1. It is not a real number and cannot equal any real value. Specifically, (1/√10)² = 1/10 ≠ −1. So i ≠ 1/√10 in standard mathematics. However, |i| = 1 (the modulus of i is 1), and 1/√10 ≈ 0.316 has modulus 0.316. They are genuinely different.

The Codex interpretation treats i as encoding a 'harmonic inversion' — a 90° phase rotation that maps real axes onto each other. This is geometrically correct: multiplying by i does rotate the complex plane by 90°. The connection to 1/√10 = sech(θ₆) comes from Robert Grant's Harmonic Theory ground state.

The actual mathematics of complex numbers:

A complex number z = a + bi has:
  Real part: Re(z) = a
  Imaginary part: Im(z) = b
  Modulus: |z| = √(a²+b²)
  Argument: arg(z) = arctan(b/a) (adjusted for quadrant)
  Conjugate: z̄ = a − bi

The powers of i cycle with period 4:
  i^0=1, i^1=i, i^2=−1, i^3=−i, i^4=1, i^5=i, …

Euler's formula — the most important formula in complex analysis:
  e^(iθ) = cos θ + i·sin θ

This means every point on the unit circle in the complex plane can be written as e^(iθ) for some angle θ. The unit circle is the 'breath circle' — all complex numbers of modulus 1.

Euler's identity (the most beautiful equation): e^(iπ) + 1 = 0. This connects the five most important numbers in mathematics: e, i, π, 1, and 0.`,key_points:[`i² = −1 by definition. i ≠ 1/√10 (mathematically), though both appear in Codex/Grant theory.`,`Powers: i^0=1, i^1=i, i^2=−1, i^3=−i, then repeats (period 4).`,`Modulus: |a+bi| = √(a²+b²). Conjugate: ā+bi = a−bi.`,`Euler's formula: e^(iθ) = cosθ + i·sinθ. The unit circle in complex notation.`,`Euler's identity: e^(iπ)+1=0. Unites e, i, π, 1, 0.`,`Product with conjugate: (a+bi)(a−bi) = a²+b² (always real, the squared modulus).`],formulas:[{label:`Imaginary unit`,expression:`i² = −1, i^4 = 1, cycles: 1, i, −1, −i, 1, …`,description:`The defining property and 4-cycle of i.`},{label:`Complex modulus`,expression:`|a+bi| = √(a²+b²)`,description:`Distance from origin in the complex plane.`},{label:`Euler's formula`,expression:`e^(iθ) = cos(θ) + i·sin(θ)`,description:`The bridge between complex exponentials and trigonometry.`},{label:`Euler's identity`,expression:`e^(iπ) + 1 = 0`,description:`Follows from Euler's formula with θ=π.`},{label:`De Moivre's theorem`,expression:`(cosθ + i·sinθ)^n = cos(nθ) + i·sin(nθ)`,description:`Raising a unit complex number to a power multiplies the angle.`},{label:`Conjugate product`,expression:`(a+bi)(a−bi) = a² + b²`,description:`Always real; equals |z|².`}],worked_examples:[{title:`Compute (1+i)^4 using De Moivre's theorem`,steps:[`Write 1+i in polar form: |1+i|=√2, arg=π/4.`,`So 1+i = √2·e^(iπ/4).`,`(1+i)^4 = (√2)^4·e^(i·4·π/4) = 4·e^(iπ) = 4·(cos π + i·sin π) = 4·(−1+0) = −4.`,`Check directly: (1+i)^2=2i; (2i)^2=4i²=−4. ✓`]},{title:`Find all 4th roots of unity`,steps:[`Solve z^4=1. The four roots are e^(2πik/4) for k=0,1,2,3.`,`k=0: e^0=1. k=1: e^(iπ/2)=i. k=2: e^(iπ)=−1. k=3: e^(i3π/2)=−i.`,`Roots: 1, i, −1, −i. They sit at 0°, 90°, 180°, 270° on the unit circle.`,`These form a square (the 4-gon) inscribed in the unit circle.`]}]},{id:`cdx3_s3`,heading:`Section 3 — Logarithms: The Language of Harmonic Scaling`,body:`Logarithms appear throughout the Codex because they convert multiplicative scaling (×HL, ×2, ×10) into additive steps. This is the core of all logarithmic scales.

Definition: log_b(x) is the power to which b must be raised to get x.
  log₁₀(1000) = 3  because 10³=1000
  log₂(64) = 6    because 2⁶=64
  ln(e²) = 2       because e²=e²

Logarithm laws (the fundamental tools):
  log(xy) = log(x) + log(y)    [product rule]
  log(x/y) = log(x) − log(y)  [quotient rule]
  log(x^n) = n·log(x)         [power rule]
  log_b(x) = log(x)/log(b)    [change of base]

Logarithmic scales appear everywhere because our senses and many physical phenomena are approximately logarithmic:

  Decibels: dB = 10·log₁₀(I/I₀). Each ×10 in intensity = +10 dB.
  Richter scale: each unit = ×10 in amplitude. Mag 7 = 100× the amplitude of mag 5.
  pH: pH = −log₁₀[H⁺]. Pure water: [H⁺]=10⁻⁷, pH=7.
  Octave: +12 dB (in acoustics) corresponds to doubling amplitude.

The Harmonic Light Constant connects to logarithms elegantly:
  HL^n = 10^(n/12). Taking log₁₀: log₁₀(HL^n) = n/12.
  Therefore: n = 12·log₁₀(HL^n).

This means: to find how many HL steps correspond to any given scaling factor, multiply its base-10 logarithm by 12. Example: for a factor of 2: n = 12·log₁₀(2) = 12×0.301 ≈ 3.61 HL steps.`,key_points:[`log_b(x)=y means b^y=x. Three bases: log₁₀ (common), ln (natural, base e), log₂ (binary).`,`Laws: log(xy)=log(x)+log(y); log(xⁿ)=n·log(x); change of base=log(x)/log(b).`,`Decibels: dB=10·log₁₀(I/I₀). Each decade = 10 dB.`,`pH = −log₁₀[H⁺]. Neutral water pH=7 (i.e., [H⁺]=10⁻⁷).`,`HL connection: n HL steps for ratio r means r=HL^n=10^(n/12), so n=12·log₁₀(r).`,`Factor of 2 (one musical octave) ≈ 3.61 HL steps (since log₁₀(2)≈0.301, ×12≈3.61).`],formulas:[{label:`Logarithm definition`,expression:`log_b(x)=y ↔ b^y=x`,description:`The fundamental definition.`},{label:`Product rule`,expression:`log(xy) = log(x) + log(y)`,description:`Logarithm of a product = sum of logarithms.`},{label:`Power rule`,expression:`log(x^n) = n·log(x)`,description:`Exponent comes down as coefficient.`},{label:`Change of base`,expression:`log_b(x) = log(x)/log(b) = ln(x)/ln(b)`,description:`Convert between bases.`},{label:`Decibel formula`,expression:`dB = 10·log₁₀(I/I₀)`,description:`Each ×10 in intensity = +10 dB.`},{label:`pH formula`,expression:`pH = −log₁₀[H⁺]`,description:`Negative base-10 log of hydrogen ion concentration.`}],worked_examples:[{title:`Solve log₂(x) = 5`,steps:[`log₂(x)=5 means 2^5=x.`,`x=2^5=32.`]},{title:`How many HL steps from 1 Hz to 50 Hz?`,steps:[`n = 12·log₁₀(50/1) = 12·log₁₀(50).`,`log₁₀(50)=log₁₀(100/2)=log₁₀(100)−log₁₀(2)=2−0.301=1.699.`,`n=12×1.699≈20.39 HL steps.`,`Check: HL^20≈10^(20/12)=10^1.667≈46.4. HL^21≈10^(21/12)=10^1.75≈56.2. 50 Hz is between step 20 and 21. ✓`]}]},{id:`cdx3_s4`,heading:`Section 4 — Standing Waves: The Physical Harmonic Field`,body:`The Codex proposes that all forces are 'modal regimes of a single recursive wavefield'. Regardless of whether this unification holds, standing waves are real physical phenomena whose mathematics is exactly computable.

A standing wave forms when two identical waves travel in opposite directions along the same medium. Instead of propagating, the wave pattern appears to 'stand still' — some points (nodes) never move, others (antinodes) oscillate with maximum amplitude.

For a string of length L fixed at both ends:
  Fundamental (n=1):  f₁ = v/(2L),  λ₁=2L
  2nd harmonic (n=2): f₂ = v/L,     λ₂=L
  n-th harmonic:      fₙ = n·v/(2L), λₙ=2L/n

where v is the wave speed (for sound in air: v≈343 m/s at 20°C).

Nodes and antinodes: the n-th harmonic has n antinodes and n+1 nodes.

Wave superposition (the Codex 'field unification' principle):
  - Constructive: two waves in phase → amplitude doubles.
  - Destructive: two waves exactly out of phase (180° = π apart) → cancel completely.
  - In general: two waves with amplitudes A₁, A₂ and phase difference δ give resultant amplitude √(A₁²+A₂²+2A₁A₂cos δ).

The inverse square law: intensity I ∝ 1/r². Doubling the distance from a point source reduces intensity to 1/4. This applies to both gravity and electromagnetic radiation — the connection the Codex draws between them.`,key_points:[`Standing wave: fₙ=n·v/(2L), λₙ=2L/n. n-th harmonic has n antinodes, n+1 nodes.`,`Fundamental frequency f₁=v/(2L). All harmonics are integer multiples: fₙ=n·f₁.`,`Constructive interference: waves in phase → amplitudes add.`,`Destructive interference: 180° out of phase → complete cancellation.`,`Inverse square law: I∝1/r². Applies to both gravity and radiation.`,`Wave speed of sound: v≈343 m/s (air, 20°C). Wavelength: λ=v/f.`],formulas:[{label:`n-th harmonic frequency`,expression:`fₙ = n·v/(2L)`,description:`For string of length L, wave speed v.`},{label:`n-th harmonic wavelength`,expression:`λₙ = 2L/n`,description:`Wavelength of n-th standing wave.`},{label:`Wavelength from frequency`,expression:`λ = v/f`,description:`Connects wavelength, wave speed, and frequency.`},{label:`Nodes and antinodes`,expression:`n antinodes → n+1 nodes (for fixed-end string)`,description:`Structure of the n-th harmonic.`},{label:`Inverse square law`,expression:`I ∝ 1/r² (I₁/I₂ = r₂²/r₁²)`,description:`Intensity falls as square of distance.`},{label:`Resultant amplitude`,expression:`A = √(A₁²+A₂²+2A₁A₂cos δ)`,description:`General superposition of two waves with phase difference δ.`}],worked_examples:[{title:`Guitar string A=440 Hz, L=0.65 m: find v and the 3rd harmonic`,steps:[`f₁=440 Hz, L=0.65 m. v=2Lf₁=2×0.65×440=572 m/s.`,`3rd harmonic: f₃=3×440=1320 Hz, λ₃=2L/3=2×0.65/3≈0.433 m.`,`Check: v=f₃×λ₃=1320×0.433≈572 m/s. ✓`]},{title:`Intensity drop: from 1 m to 10 m`,steps:[`I∝1/r². At r₁=1: I₁=1 (reference).`,`At r₂=10: I₂=I₁×(r₁/r₂)²=1×(1/10)²=1/100.`,`Distance increases by ×10 → intensity decreases by ×100. In decibels: −20 dB.`]}]},{id:`cdx3_s5`,heading:`Section 5 — Roots of Unity: Harmonic Geometry of the Complex Plane`,body:`The n-th roots of unity are the n solutions to the equation zⁿ=1. They form a perfect regular n-gon inscribed in the unit circle in the complex plane.

Explicit formula: the k-th root of unity (k=0,1,…,n−1) is:

  ωₖ = e^(2πik/n) = cos(2πk/n) + i·sin(2πk/n)

They are equally spaced at angles 2π/n apart, starting at ω₀=1 (angle=0).

Key cases:
  n=2: {1, −1}. Two points at 0° and 180°.
  n=3: {1, e^(2πi/3), e^(4πi/3)}. Equilateral triangle.
  n=4: {1, i, −1, −i}. Square (at 0°, 90°, 180°, 270°).
  n=5: Pentagon. Five 5th roots of unity.
  n=6: Hexagon. Six 6th roots: {1, e^(iπ/3), e^(2iπ/3), −1, e^(4iπ/3), e^(5iπ/3)}.
  n=12: Dodecagon — the Codex 12-phase harmonic geometry!

All n-th roots of unity have modulus 1 (they lie on the unit circle). Their sum is always 0: Σωₖ=0. Their product is (−1)^(n+1).

The Codex connection: the 12 roots of unity form a regular 12-gon (dodecagon) on the unit circle — this is the 'harmonic memory circle' of the Codex. The 12 equally-spaced positions mirror the 12 HL steps that traverse one decade, and the 12 tones of the chromatic scale. All three are '12-phase harmonic systems'.

De Moivre's theorem for roots: to find the n-th roots of any complex number z=r·e^(iθ), the roots are:
  r^(1/n) · e^(i(θ+2πk)/n)  for k=0,1,…,n−1`,key_points:[`n-th roots of unity: ωₖ=e^(2πik/n), k=0,1,…,n−1. Form a regular n-gon on the unit circle.`,`All have modulus 1. Sum = 0. Product = (−1)^(n+1).`,`n=4: {1,i,−1,−i} (square). n=6: hexagon. n=12: dodecagon = Codex 12-phase circle.`,`De Moivre's theorem: (cosθ+i·sinθ)^n = cos(nθ)+i·sin(nθ).`,`n-th roots of z=r·e^(iθ): magnitude r^(1/n), angles (θ+2πk)/n for k=0,…,n−1.`,`The 12th roots of unity, 12 HL steps, and 12 chromatic tones are all 12-phase harmonic structures.`],formulas:[{label:`n-th roots of unity`,expression:`ωₖ = e^(2πik/n) = cos(2πk/n)+i·sin(2πk/n)`,description:`k=0,1,…,n−1. Forms regular n-gon.`},{label:`Sum of roots`,expression:`Σωₖ = 0 (for n≥2)`,description:`All n-th roots of unity sum to zero.`},{label:`Separation angle`,expression:`2π/n radians = 360°/n`,description:`Angle between consecutive roots.`},{label:`De Moivre's`,expression:`(cosθ+i·sinθ)^n = cos(nθ)+i·sin(nθ)`,description:`Multiplying angle by n when raising to power n.`},{label:`General n-th roots`,expression:`z^(1/n): magnitude r^(1/n), angles (θ+2πk)/n`,description:`n-th roots of any complex number z.`}],worked_examples:[{title:`Find all cube roots of unity (n=3)`,steps:[`ω₀=e^0=1. ω₁=e^(2πi/3)=cos(120°)+i·sin(120°)=−1/2+i√3/2. ω₂=e^(4πi/3)=−1/2−i√3/2.`,`Check sum: 1+(−1/2+i√3/2)+(−1/2−i√3/2) = 1−1/2−1/2+i(√3/2−√3/2) = 0. ✓`,`They form an equilateral triangle with vertices at 0°, 120°, 240° on the unit circle.`]},{title:`12th roots of unity: describe the geometry`,steps:[`The 12 roots are e^(2πik/12)=e^(πik/6) for k=0,1,…,11.`,`Each root is at angle k×30° on the unit circle (every 30°).`,`They form a regular dodecagon (12-gon). Real roots: ±1 (at k=0 and k=6).`,`k=0: 1. k=1: e^(iπ/6)=√3/2+i/2. k=2: e^(iπ/3)=1/2+i√3/2. k=3: e^(iπ/2)=i. Etc.`,`These 12 positions mirror the 12 HL harmonic domains and the 12 chromatic tones.`]}]},{id:`cdx3_s6`,heading:`Section 6 — Connecting the Threads: HL, √10, i, and 12-Phase Harmony`,body:`We can now see all the advanced Codex topics as facets of one mathematical structure.

The number 12 appears in three different harmonic contexts, all connected:
  1. HL: 12 steps of ×10^(1/12) span one decade (×10).
  2. Equal temperament: 12 semitones of ×2^(1/12) span one octave (×2).
  3. Roots of unity: 12 roots of z^12=1 form a dodecagon on the unit circle.

√10 bridges the harmonic and complex worlds:
  HL^6 = √10 ≈ 3.1623   (midpoint of the HL decade scale)
  √10 = cosh(arcsinh(3)) (Harmonic Theory ground state from Lecture cdx2)
  √10 = √2 × √5         (product of two primary harmonic roots)
  1/√10 = sech(θ₆)       (the reciprocal appears in the fine-structure constant derivation)

The Codex claim 'i = 1/√10' reinterpreted correctly: they share the property of being 'harmonic inversion operators' in their respective domains — i rotates by 90° in the complex plane (a quarter-breath), while 1/√10 = HL^(−6) inverts the midpoint of the decade scale. Both perform a kind of harmonic 'phase flip'.

The unified picture:
  All 12-phase systems → regular 12-gon geometry (whether on the unit circle, frequency ratios, or harmonic domains).
  HL and complex roots of unity are both based on 12-fold symmetry.
  Logarithms (base 10) are the natural language connecting them.
  The inverse square law connects wave intensity to distance, unifying gravity and radiation in their mathematical form (both follow 1/r²).

The mathematics here is solid and beautiful. The Codex provides a poetic framework for this beauty. Hold both.`,key_points:[`12 appears in HL (decade scale), equal temperament (octave scale), and 12th roots of unity (circle).`,`√10: appears as HL^6, cosh(arcsinh(3)), √2×√5, and 1/sech(θ₆). A truly central value.`,`Codex 'i=1/√10': both are harmonic inversion operators in their domains, though not equal as numbers.`,`All forces following 1/r²: both gravity and EM radiation share the same inverse-square form.`,`The 12-fold symmetry (dodecagon, 12 HL steps, 12 semitones) is a deep harmonic structure.`,`Mathematics is the bridge: solid, calculable, beautiful — with or without the Codex framing.`],formulas:[{label:`√10 connections`,expression:`√10 = HL^6 = √2×√5 = cosh(arcsinh(3)) ≈ 3.1623`,description:`Four different ways √10 appears in the Codex framework.`},{label:`12-phase unification`,expression:`12th roots: e^(2πik/12); 12 HL steps: 10^(n/12); 12 semitones: 2^(n/12)`,description:`Three 12-step harmonic systems.`},{label:`Inverse square law`,expression:`I ∝ 1/r² (gravity: F∝1/r²; EM: I∝1/r²)`,description:`The shared mathematical form of gravity and radiation.`}],worked_examples:[{title:`Show that 12 HL steps and 12 semitones have different ratios but the same structure`,steps:[`12 HL steps: (10^(1/12))^12 = 10. Ratio per step ≈ 1.1007.`,`12 semitones: (2^(1/12))^12 = 2. Ratio per step ≈ 1.0595.`,`Same structure: 12 equal multiplicative steps forming a 12-fold scale.`,`Ratio between them: HL/semitone = (10/2)^(1/12) = 5^(1/12) ≈ 1.0405.`,`The Codex HL scale is a 'stretched semitone' — the same 12-phase architecture, applied to a decade instead of an octave.`]}]}],l={key_takeaways:[`HL=10^(1/12)≈1.1007. HL^12=10 (one decade). HL^6=√10≈3.1623 (Axiom XXIV midpoint).`,`Complex numbers: i²=−1; i≠1/√10 (different things). Modulus |a+bi|=√(a²+b²).`,`Euler's formula: e^(iθ)=cosθ+i·sinθ. Euler's identity: e^(iπ)+1=0.`,`Logarithms: log_b(x)=y means b^y=x. Power rule: log(xⁿ)=n·log(x). Decibels: 10·log₁₀(I/I₀).`,`Standing waves: fₙ=n·v/(2L). Inverse square law: I∝1/r².`,`n-th roots of unity: ωₖ=e^(2πik/n). Form a regular n-gon. Sum=0. The 12th roots = dodecagon.`,`The 12-fold structure (HL steps, equal temperament, roots of unity) is a deep harmonic symmetry.`],core_formulas:[{label:`Harmonic Light Constant`,expression:`HL = 10^(1/12) ≈ 1.100694`},{label:`HL decade`,expression:`HL^12 = 10`},{label:`Euler's identity`,expression:`e^(iπ) + 1 = 0`},{label:`Complex modulus`,expression:`|a+bi| = √(a²+b²)`},{label:`Log power rule`,expression:`log(xⁿ) = n·log(x)`},{label:`Standing wave frequency`,expression:`fₙ = n·v/(2L)`},{label:`Roots of unity`,expression:`ωₖ = e^(2πik/n), k=0,…,n−1`}]},u=[{question:`HL=10^(1/12). What is HL^3 exactly? And approximately (to 4dp)?`,answer:`HL^3=10^(3/12)=10^(1/4)=∜10≈1.7783.`,difficulty:`medium`},{question:`Compute i^47. (Remember: i cycles with period 4.)`,answer:`47=4×11+3. i^47=i^3=−i.`,difficulty:`easy`},{question:`Find the modulus of 5+12i.`,answer:`|5+12i|=√(25+144)=√169=13.`,difficulty:`easy`},{question:`e^(iπ/3) expressed as a+bi?`,answer:`e^(iπ/3)=cos(60°)+i·sin(60°)=1/2+i√3/2≈0.5+0.866i.`,difficulty:`medium`},{question:`A sound source emits 100 dB at 1 m. At 10 m (×10 distance), intensity falls by ×100. What is the new dB level?`,answer:`Each ×10 in intensity = 10 dB. ×100 less = −20 dB. New level = 100−20=80 dB.`,difficulty:`medium`},{question:`The 6 sixth-roots of unity form a regular hexagon. What angle separates adjacent vertices?`,answer:`360°/6=60°. Adjacent sixth roots of unity are separated by 60°.`,difficulty:`easy`},{question:`Using HL: how many steps does it take to double (×2)? (n=12·log₁₀(2)=?)`,answer:`n=12×log₁₀(2)=12×0.30103≈3.61 steps. A factor of 2 takes about 3.61 HL steps.`,difficulty:`hard`}],d={id:e,title:t,subtitle:n,source_document:r,lecture_number:1,total_lectures:1,estimated_reading_minutes:30,overview:s,sections:c,summary:l,review_questions:u};export{d as default,o as estimated_reading_minutes,e as id,i as lecture_number,s as overview,u as review_questions,c as sections,r as source_document,n as subtitle,l as summary,t as title,a as total_lectures};