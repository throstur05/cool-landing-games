var e=`lecture_cdx4_01`,t=`Codex New Math 4 — Advanced Topics II`,n=`HL Fractional Steps · Polar Complex Numbers · Trig Identities · Matrices · Fourier · Spirals · Binary`,r=`Codex Universalis — Advanced Math, Extended Topics`,i=1,a=1,o=32,s=`This lecture extends the advanced Codex math topics with seven areas of new mathematics: fractional HL steps and musical cents; the polar form of complex numbers and complex division; trigonometric identities as the real language of harmonic fields; 2×2 matrices as recursive field operators; Fourier series as harmonic decomposition; spiral geometry and continued fractions; and binary/hexadecimal as the substrate of harmonic computing. Every section is grounded in verifiable mathematics with worked examples and definite answers.`,c=[{id:`s1`,heading:`Section 1 — HL in Fractional Steps and Musical Cents`,body:`The Harmonic Light Constant HL=10^(1/12) defines 12 integer steps across one decade. But we can also take fractional steps: HL^(n/m) = 10^(n/(12m)) for any integers n, m.

Key fractional steps:
  HL^(1/4) = 10^(1/48) ≈ 1.0492   (quarter HL step)
  HL^(1/3) = 10^(1/36) ≈ 1.0655   (third HL step)
  HL^(1/2) = 10^(1/24) ≈ 1.0965   (half HL step)
  HL^(2/3) = 10^(2/36) ≈ 1.0965×HL^(1/3)
  HL^(3/4) = 10^(3/48) ≈ 1.0746 (three-quarter HL step)

Musical cents: a musical octave contains 1200 cents (100 per semitone). The HL step in cents:
  HL_cents = 1200 × log₂(HL) = 1200 × log₂(10^(1/12)) = 100 × log₂(10) ≈ 100 × 3.3219 ≈ 332 cents.

Wait — let me recompute: 1200×log₂(10^(1/12)) = 1200/12×log₂(10) = 100×log₂(10) ≈ 100×3.3219 ≈ 332.2 cents.

So one HL step spans about 3.32 semitones — between a minor third (3 semitones) and a major third (4 semitones). This is why the HL harmonic scale sounds somewhat dissonant compared to the standard equal-tempered scale.

Compare: 1 semitone = 100 cents. 1 HL step ≈ 332 cents = 3.32 semitones.

The HL scale and the chromatic scale share the same 12-step architecture but span different intervals. The chromatic scale spans one octave (×2); the HL scale spans one decade (×10).`,key_points:[`HL^(1/2)=10^(1/24)≈1.0965 (half HL step). HL^(1/3)=10^(1/36)≈1.0655 (third step).`,`HL in cents: 100×log₂(10)≈332 cents ≈ 3.32 semitones.`,`One HL step lies between a musical minor third (300 cents) and major third (400 cents).`,`HL scales: 12 steps × 332 cents = 3984 cents ≈ 3.32 octaves for one decade.`,`Physical constants can be located by their HL step: n=12×log₁₀(value).`,`Speed of light c≈3×10^8 m/s → n=12×log₁₀(3×10^8)≈102 HL steps from 1.`],formulas:[{label:`Fractional HL step`,expression:`HL^(p/q) = 10^(p/(12q))`,description:`Any fractional power of HL.`},{label:`HL in musical cents`,expression:`1200×log₂(HL) = 100×log₂(10) ≈ 332.19 cents`,description:`One HL step expressed in musical cents.`},{label:`HL step number for value`,expression:`n = 12×log₁₀(value)`,description:`Which HL step corresponds to a given value.`},{label:`HL vs octave`,expression:`HL^12=10 (decade); 2^12=4096 (≠decade). They share 12-step structure only.`,description:`The two 12-step systems are mathematically distinct.`}],worked_examples:[{title:`How many HL steps from 1 to the electron mass mₑ≈9.11×10^{−31} kg?`,steps:[`n = 12×log₁₀(9.11×10^{−31}).`,`log₁₀(9.11×10^{−31}) = log₁₀(9.11)+log₁₀(10^{−31}) = 0.9595+(−31) = −30.0405.`,`n = 12×(−30.0405) ≈ −360.5 HL steps.`,`The electron mass is about 360 HL steps below 1 kg — deep in the harmonic below.`]}]},{id:`s2`,heading:`Section 2 — Polar Form and Complex Division`,body:`Every complex number z=a+bi can be written in polar form z=r·e^(iθ) where r=|z|=√(a²+b²) is the modulus and θ=arg(z) is the argument (angle). This representation is essential for:
  - Multiplication: z₁·z₂ = r₁r₂·e^(i(θ₁+θ₂))  [multiply moduli, add angles]
  - Division: z₁/z₂ = (r₁/r₂)·e^(i(θ₁−θ₂))    [divide moduli, subtract angles]
  - Powers: zⁿ = rⁿ·e^(inθ)                       [De Moivre's theorem]

Complex division in rectangular form: to compute (a+bi)/(c+di), multiply top and bottom by the conjugate of the denominator:
  (a+bi)/(c+di) = (a+bi)(c−di)/((c+di)(c−di)) = (a+bi)(c−di)/(c²+d²)

This always produces a real denominator.

Quadratic equations with complex roots: if the discriminant b²−4ac < 0, the quadratic has two complex conjugate roots:
  x = (−b ± i√|b²−4ac|) / (2a)

Example: x²+2x+5=0. Discriminant = 4−20=−16. Roots = (−2±i√16)/2 = −1±2i.

Polar form and the complex plane: a point at angle θ and radius r is:
  r·e^(iθ) = r·(cosθ + i·sinθ)

The unit circle (r=1) consists of all points e^(iθ) — the 'breath circle' where modulus=1.`,key_points:[`Polar form: z=r·e^(iθ), r=|z|=√(a²+b²), θ=arg(z)=arctan(b/a) (quadrant-adjusted).`,`Multiplication: multiply moduli, add angles.`,`Division: divide moduli, subtract angles.`,`Complex division (rectangular): multiply by conjugate of denominator: (a+bi)/(c+di)×(c−di)/(c−di).`,`Quadratic complex roots: x=(−b±i√|D|)/(2a) when D=b²−4ac<0.`,`Roots are always complex conjugates: if x=p+qi is a root, so is x=p−qi.`],formulas:[{label:`Polar form`,expression:`z = r·e^(iθ) = r·(cosθ+i·sinθ), r=|z|, θ=arg(z)`,description:`Polar representation of any complex number.`},{label:`Complex multiplication (polar)`,expression:`z₁·z₂ = r₁r₂·e^(i(θ₁+θ₂))`,description:`Multiply moduli, add angles.`},{label:`Complex division (rectangular)`,expression:`(a+bi)/(c+di) = (a+bi)(c−di)/(c²+d²)`,description:`Multiply by conjugate of denominator.`},{label:`Quadratic complex roots`,expression:`x = (−b ± i√|D|)/(2a) when D=b²−4ac<0`,description:`Two complex conjugate roots.`},{label:`De Moivre`,expression:`(r·e^(iθ))^n = rⁿ·e^(inθ)`,description:`Powers in polar form.`}],worked_examples:[{title:`Solve x²+4x+13=0`,steps:[`Discriminant D=16−52=−36<0.`,`Roots = (−4±i√36)/2 = (−4±6i)/2 = −2±3i.`,`Roots: x=−2+3i and x=−2−3i (complex conjugates).`,`Verify: (x+2)²=−9 → x+2=±3i → x=−2±3i. ✓`]},{title:`Compute (3+4i)/(1+2i) using conjugate multiplication`,steps:[`Multiply by (1−2i)/(1−2i): numerator=(3+4i)(1−2i)=3−6i+4i−8i²=3−2i+8=11−2i.`,`Denominator=(1+2i)(1−2i)=1+4=5.`,`Result: (11−2i)/5 = 11/5 − 2i/5 = 2.2 − 0.4i.`]}]},{id:`s3`,heading:`Section 3 — Trigonometric Identities: The Language of Harmonic Fields`,body:`Trigonometric identities are the mathematical backbone of all wave and field descriptions. The Codex uses them as 'harmonic field equations'. Here are the essential ones.

Pythagorean identities (from the unit circle x²+y²=1):
  sin²θ + cos²θ = 1         [fundamental]
  1 + tan²θ = sec²θ         [divide by cos²θ]
  1 + cot²θ = csc²θ         [divide by sin²θ]

Double angle formulas:
  sin(2θ) = 2sinθcosθ
  cos(2θ) = cos²θ−sin²θ = 1−2sin²θ = 2cos²θ−1
  tan(2θ) = 2tanθ/(1−tan²θ)

Sum formulas:
  sin(A+B) = sinAcosB + cosAsinB
  cos(A+B) = cosAcosB − sinAsinB
  sin(A−B) = sinAcosB − cosAsinB
  cos(A−B) = cosAcosB + sinAsinB

Product-to-sum:
  sinA·sinB = ½[cos(A−B)−cos(A+B)]
  cosA·cosB = ½[cos(A−B)+cos(A+B)]
  sinA·cosB = ½[sin(A+B)+sin(A−B)]

The product-to-sum formulas are directly responsible for beat frequencies in acoustics: two close frequencies f₁ and f₂ combine to produce sum (f₁+f₂) and difference (|f₁−f₂|) frequencies — the beat is the difference.

Key values:
  sin0°=0, sin30°=1/2, sin45°=√2/2, sin60°=√3/2, sin90°=1
  cos0°=1, cos30°=√3/2, cos45°=√2/2, cos60°=1/2, cos90°=0
  tan30°=1/√3, tan45°=1, tan60°=√3`,key_points:[`sin²θ+cos²θ=1 always (Pythagorean identity). Leads to 1+tan²θ=sec²θ.`,`sin(2θ)=2sinθcosθ. cos(2θ)=1−2sin²θ=2cos²θ−1.`,`sin(A+B)=sinAcosB+cosAsinB. cos(A+B)=cosAcosB−sinAsinB.`,`Beat frequency: |f₂−f₁|. From product-to-sum: sinA·sinB has term at frequency (A−B)/2.`,`3-4-5 in harmonics: 3·cos+4·cos at 90° phase difference → amplitude 5 (Pythagorean!)`,`Key values: sin60°=cos30°=√3/2. sin45°=cos45°=√2/2.`],formulas:[{label:`Pythagorean identity`,expression:`sin²θ + cos²θ = 1`,description:`Fundamental harmonic identity.`},{label:`Double angle sin`,expression:`sin(2θ) = 2sinθcosθ`,description:`Twice-frequency term.`},{label:`Double angle cos`,expression:`cos(2θ) = 1 − 2sin²θ = 2cos²θ − 1`,description:`Three equivalent forms.`},{label:`Sum formula`,expression:`sin(A+B) = sinAcosB + cosAsinB`,description:`Expands sum of angles.`},{label:`Beat frequency`,expression:`f_beat = |f₂−f₁|`,description:`From product-to-sum formula.`}],worked_examples:[{title:`Prove sin(60°) = √3/2 using the double angle formula`,steps:[`sin(60°)=sin(2×30°)=2·sin(30°)·cos(30°).`,`=2×(1/2)×(√3/2) = 2×√3/4 = √3/2. ✓`]},{title:`If sin(θ)=3/5, find cos(2θ)`,steps:[`cos(2θ)=1−2sin²(θ)=1−2×(3/5)²=1−2×9/25=1−18/25=7/25.`,`Alternatively: cos(θ)=4/5 (from Pythagorean: cos²=1−9/25=16/25).`,`cos(2θ)=cos²(θ)−sin²(θ)=16/25−9/25=7/25. ✓`]}]},{id:`s4`,heading:`Section 4 — Matrices: Recursive Field Operators`,body:`The Codex proposes a 'recursive field logic network' for its axioms. The mathematical substrate of linear recursive operations is matrix algebra. A 2×2 matrix is a compact representation of a linear transformation.

Matrix multiplication: A×B ≠ B×A in general (non-commutative!):
  [[a,b],[c,d]] × [[e,f],[g,h]] = [[ae+bg, af+bh],[ce+dg, cf+dh]]

Key matrices:
  Identity I=[[1,0],[0,1]]: I×A=A×I=A (the 'stillness' operator).
  Rotation by θ: R=[[cosθ,−sinθ],[sinθ,cosθ]]. det(R)=1. Preserves length.
  Reflection: [[1,0],[0,−1]] reflects across x-axis. det=−1.

Determinant: det([[a,b],[c,d]])=ad−bc. Key properties:
  - det(A)=0 ↔ matrix is singular (non-invertible, collapses space to lower dimension).
  - det(A×B)=det(A)×det(B).
  - det(rotation)=1. det(reflection)=−1.

Eigenvalues and eigenvectors: for a matrix A, λ is an eigenvalue if there exists a nonzero vector v with Av=λv. Find eigenvalues by solving det(A−λI)=0.

For [[a,b],[c,d]]: characteristic equation = λ²−(a+d)λ+(ad−bc)=0.
  λ = [(a+d) ± √((a+d)²−4(ad−bc))]/2
  = [trace ± √(trace²−4·det)]/2

Eigenvectors give the 'harmonic axes' — the directions along which the matrix acts as a simple scaling.`,key_points:[`Matrix multiplication: row×column. Non-commutative: A×B≠B×A generally.`,`Determinant: ad−bc. Zero → singular (space collapsed). det(R)=1 for rotations.`,`Eigenvalues: det(A−λI)=0 → λ²−trace·λ+det=0.`,`trace=a+d (sum of diagonal). det=ad−bc. Eigenvalues from quadratic formula.`,`Rotation matrix [[cosθ,−sinθ],[sinθ,cosθ]]: preserves all distances and angles.`,`Singular matrix (det=0): at least two rows are linearly dependent — a 'harmonic collapse'.`],formulas:[{label:`Matrix multiplication`,expression:`(A×B)[i][j] = Σₖ A[i][k]×B[k][j]`,description:`Row i of A times column j of B.`},{label:`2×2 determinant`,expression:`det([[a,b],[c,d]]) = ad − bc`,description:`Signed area scaling factor.`},{label:`Characteristic equation`,expression:`λ² − (a+d)λ + (ad−bc) = 0`,description:`Eigenvalue equation for 2×2 matrix.`},{label:`Eigenvalue formula`,expression:`λ = [trace ± √(trace²−4·det)]/2`,description:`Quadratic formula applied to characteristic equation.`},{label:`Rotation matrix`,expression:`R(θ) = [[cosθ,−sinθ],[sinθ,cosθ]], det(R)=1`,description:`Rotates all vectors by θ, preserves lengths.`}],worked_examples:[{title:`Find eigenvalues of [[2,1],[1,2]]`,steps:[`trace = 2+2 = 4. det = 2×2−1×1 = 3.`,`Characteristic equation: λ²−4λ+3=0.`,`(λ−3)(λ−1)=0 → λ=3 or λ=1.`,`Eigenvectors: for λ=3: (A−3I)v=0 → [[-1,1],[1,-1]]v=0 → v=[1,1] (diagonal).`,`For λ=1: (A−I)v=0 → [[1,1],[1,1]]v=0 → v=[1,−1] (anti-diagonal). ✓`]}]},{id:`s5`,heading:`Section 5 — Fourier Series: Harmonic Decomposition`,body:`Any periodic function f(x) with period 2π can be written as an infinite sum of sines and cosines — this is the Fourier series:

  f(x) = a₀ + Σ[n=1 to ∞] (aₙcos(nx) + bₙsin(nx))

where the Fourier coefficients are:
  a₀ = (1/2π)∫f(x)dx (from 0 to 2π)
  aₙ = (1/π)∫f(x)cos(nx)dx
  bₙ = (1/π)∫f(x)sin(nx)dx

This is the precise mathematical meaning of 'harmonic decomposition' — the Codex phrase 'information stored as standing wave patterns'. Every periodic signal IS a collection of harmonics, each with its own amplitude (√(aₙ²+bₙ²)) and phase.

Key examples:
  Square wave: f(x) = (4/π)[sin(x) + sin(3x)/3 + sin(5x)/5 + …] (only odd harmonics)
  Sawtooth: f(x) = 2[sin(x) − sin(2x)/2 + sin(3x)/3 − …] (all harmonics, alternating)
  Triangle: f(x) = (8/π²)[sin(x) − sin(3x)/9 + sin(5x)/25 − …] (odd harmonics, 1/n²)

The amplitude of the n-th harmonic is Aₙ=√(aₙ²+bₙ²). The power in the n-th harmonic is Aₙ²/2. Parseval's theorem: the total power = a₀²+(1/2)Σ(aₙ²+bₙ²) — power is conserved between the time domain and frequency domain.

Even and odd functions simplify the computation:
  Even f(x)=f(−x): only cosine terms (bₙ=0).
  Odd f(x)=−f(−x): only sine terms (aₙ=0).
  cos(nx) is even; sin(nx) is odd.`,key_points:[`Fourier series: f(x)=a₀+Σ(aₙcos(nx)+bₙsin(nx)). Every periodic function decomposes into harmonics.`,`Amplitude of n-th harmonic: Aₙ=√(aₙ²+bₙ²). Power: Aₙ²/2.`,`Square wave: only odd harmonics (1,3,5,…). Amplitudes 1/n.`,`Even functions: only cosine terms. Odd functions: only sine terms.`,`Parseval's theorem: total power preserved = Σ Aₙ²/2.`,`This IS the mathematical version of 'information stored as wave patterns'.`],formulas:[{label:`Fourier series`,expression:`f(x) = a₀ + Σ[aₙcos(nx) + bₙsin(nx)]`,description:`General form for period-2π functions.`},{label:`Harmonic amplitude`,expression:`Aₙ = √(aₙ² + bₙ²)`,description:`Amplitude of the n-th harmonic component.`},{label:`Square wave`,expression:`f(x) = (4/π)×Σ[sin((2k−1)x)/(2k−1)] for k=1,2,3…`,description:`Only odd harmonics; amplitudes 1/n.`},{label:`Parseval's theorem`,expression:`Power = a₀² + (1/2)Σ(aₙ²+bₙ²)`,description:`Total power = sum of harmonic powers.`}],worked_examples:[{title:`First four terms of the square wave Fourier series`,steps:[`f(x) = (4/π)[sin(x) + sin(3x)/3 + sin(5x)/5 + sin(7x)/7 + …]`,`n=1: amplitude = 4/π ≈ 1.273.`,`n=3: amplitude = 4/(3π) ≈ 0.424.`,`n=5: amplitude = 4/(5π) ≈ 0.255.`,`n=7: amplitude = 4/(7π) ≈ 0.182.`,`As more terms are added, the sum increasingly resembles a square wave.`]}]},{id:`s6`,heading:`Section 6 — Spirals, Continued Fractions, and Binary`,body:`Three final mathematical structures complete the Codex toolkit.

1. SPIRALS
Archimedean spiral: r=aθ. The radius grows linearly with angle. One turn (θ=2π): r=2πa. Used in Archimedes' screw, vinyl grooves.
Logarithmic spiral: r=e^(bθ). Radius grows exponentially. At θ=0: r=1. Self-similar: each turn multiplies r by e^(2πb). The golden spiral is a logarithmic spiral with b=ln(φ)/90° = ln(φ)/(π/2).

2. CONTINUED FRACTIONS
Every irrational number has a unique infinite continued fraction: x=[a₀;a₁,a₂,a₃,…]=a₀+1/(a₁+1/(a₂+…)).
  φ = [1;1,1,1,…] — all 1s (the simplest continued fraction, hence most irrational).
  √2 = [1;2,2,2,…] — all 2s after the first.
  π = [3;7,15,1,292,…] — irregular (transcendental).
  e = [2;1,2,1,1,4,1,1,6,…] — partial regularity.
Convergents (truncations of the continued fraction) give the best rational approximations. 22/7≈π, 355/113≈π more accurately.

3. BINARY AND HEXADECIMAL
Binary (base 2): every number = Σ bₖ×2^k where bₖ∈{0,1}.
  Connections: 2^8=256 colors, 2^16=65536, 2^32≈4 billion, 2^64≈1.8×10^19.
  Binary addition: carries propagate (1+1=10₂).
Hexadecimal (base 16): digits 0–9,A–F. Each hex digit = 4 binary digits.
  FF₁₆ = 11111111₂ = 255₁₀.
  100₁₆ = 256₁₀ = 2^8.
Connection to HL: note that log₂(HL^12)=log₂(10)≈3.32. The HL scale spans ≈3.32 octaves — the octave being the fundamental binary operation in frequency (×2).`,key_points:[`Archimedean spiral: r=aθ (linear). Logarithmic: r=e^(bθ) (exponential, self-similar).`,`Golden spiral: logarithmic, b=2ln(φ)/π≈0.3063.`,`Continued fraction: φ=[1;1,1,...]. √2=[1;2,2,...]. π=[3;7,15,1,292,...].`,`Convergents of φ: 1/1, 2/1, 3/2, 5/3, 8/5, 13/8,... are Fibonacci ratios.`,`Binary: base 2. 2^n powers: 256=2^8, 1024=2^10, 65536=2^16.`,`Hex digit = 4 bits. FF₁₆=255. 100₁₆=256.`],formulas:[{label:`Archimedean spiral`,expression:`r = aθ`,description:`Linear growth with angle.`},{label:`Logarithmic spiral`,expression:`r = e^(bθ)`,description:`Exponential growth; self-similar.`},{label:`Golden spiral b`,expression:`b = 2ln(φ)/π ≈ 0.3063`,description:`The growth rate of the golden spiral.`},{label:`φ continued fraction`,expression:`φ = [1;1,1,1,...] = 1+1/(1+1/(1+...))`,description:`Simplest continued fraction.`},{label:`Binary conversion`,expression:`n₁₀ = Σbₖ×2^k, bₖ∈{0,1}`,description:`Represent any integer in base 2.`}],worked_examples:[{title:`Compute φ as continued fraction convergents`,steps:[`φ=[1;1,1,1,...]. Convergents: 1/1=1, 2/1=2, 3/2=1.5, 5/3=1.667, 8/5=1.6, 13/8=1.625.`,`Note: these are all consecutive Fibonacci ratios F(n+1)/F(n).`,`They alternate above and below φ≈1.6180, converging from both sides.`,`The convergence is the slowest possible — φ is the 'most irrational' number.`]},{title:`Convert 255 between bases`,steps:[`255₁₀ = FF₁₆ (F=15, so FF=15×16+15=255). ✓`,`255₁₀ = 11111111₂ (eight 1s). Check: 128+64+32+16+8+4+2+1=255. ✓`,`One byte (8 bits) can store values 0–255. FF₁₆=11111111₂=255₁₀ is the maximum byte value.`]}]}],l={key_takeaways:[`HL fractional steps: HL^(p/q)=10^(p/12q). One HL step≈332 musical cents≈3.32 semitones.`,`Polar form: z=r·e^(iθ). Multiplication: add angles. Division: subtract angles.`,`Complex division: multiply by conjugate of denominator. Quadratic roots when D<0: x=(−b±i√|D|)/(2a).`,`Trig identities: sin²+cos²=1; sin(2θ)=2sinθcosθ; beat=|f₁−f₂|.`,`Matrices: det([[a,b],[c,d]])=ad−bc. Eigenvalues: λ²−trace·λ+det=0.`,`Fourier: every periodic function = sum of harmonics. Aₙ=√(aₙ²+bₙ²).`,`φ=[1;1,1,...] (most irrational). Binary: 2^8=256. FF₁₆=255₁₀=11111111₂.`],core_formulas:[{label:`HL cents`,expression:`100×log₂(10) ≈ 332 cents per HL step`},{label:`Polar form`,expression:`z = r·e^(iθ) = r(cosθ+i·sinθ)`},{label:`Complex division`,expression:`(a+bi)/(c+di) = (a+bi)(c−di)/(c²+d²)`},{label:`Pythagorean identity`,expression:`sin²θ + cos²θ = 1`},{label:`2×2 determinant`,expression:`ad − bc`},{label:`Fourier amplitude`,expression:`Aₙ = √(aₙ²+bₙ²)`},{label:`φ continued fraction`,expression:`[1;1,1,1,...] = 1+1/(1+1/(1+...))`}]},u=[{question:`HL=10^(1/12). What is HL^(1/2) expressed as a power of 10? And approximately?`,answer:`HL^(1/2)=10^(1/24)≈1.0965.`,difficulty:`medium`},{question:`Write 2+2i in polar form r·e^(iθ).`,answer:`r=|2+2i|=√(4+4)=2√2. θ=arg(2+2i)=arctan(2/2)=π/4. So 2+2i=2√2·e^(iπ/4).`,difficulty:`medium`},{question:`Solve x²+2x+10=0.`,answer:`D=4−40=−36. x=(−2±6i)/2=−1±3i.`,difficulty:`hard`},{question:`If sin(θ)=5/13 and θ is in the first quadrant, find cos(2θ).`,answer:`cos(θ)=12/13 (from 5²+12²=13²). cos(2θ)=1−2sin²θ=1−2(25/169)=1−50/169=119/169.`,difficulty:`hard`},{question:`Find the eigenvalues of [[3,0],[0,7]] (diagonal matrix).`,answer:`λ=3 and λ=7. For diagonal matrices, eigenvalues are the diagonal entries.`,difficulty:`easy`},{question:`In binary, what is 1101₂ + 0111₂?`,answer:`1101₂=13, 0111₂=7. 13+7=20=10100₂.`,difficulty:`medium`},{question:`The square wave Fourier series has only odd harmonics: 1,3,5,7,... If the fundamental is 100 Hz, list the first 4 harmonic frequencies present.`,answer:`100 Hz, 300 Hz, 500 Hz, 700 Hz. (Odd multiples of 100 Hz.)`,difficulty:`easy`}],d={id:e,title:t,subtitle:n,source_document:r,lecture_number:1,total_lectures:1,estimated_reading_minutes:32,overview:s,sections:c,summary:l,review_questions:u};export{d as default,o as estimated_reading_minutes,e as id,i as lecture_number,s as overview,u as review_questions,c as sections,r as source_document,n as subtitle,l as summary,t as title,a as total_lectures};