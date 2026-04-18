var e=`lecture_cdx5_01`,t=`Codex New Math 5 — Harmonic Solids and Higher-Dimensional Geometry`,n=`Convex & Stellated Projections · The Alphahedron · 4D Polytopes · Cascade Ratio · Phase Conjugates · Surface Area`,r=`Codex Universalis — Robert Edward Grant's Harmonic Solid Framework`,i=1,a=1,o=35,s=`This lecture covers Robert Edward Grant's framework of Harmonic Solids — an infinite family of polyhedra generated from Pythagorean triples. We derive the complete topology (V, F, E) of both the convex and stellated projections, study the Alphahedron (from the 5-12-13 triple) in depth, explore 4D polytopes and their Euler relation, understand the cascade ratio and nine harmonic means, and connect all of this to the Platonic and Archimedean solids through curvature classification. Every result is exactly calculable from the generating triangle.`,c=[{id:`s1`,heading:`Section 1 — What Is a Harmonic Solid?`,body:`A Harmonic Solid is a polyhedron generated from a right triangle (a, b, c) satisfying a²+b²=c². The core claim is that the complete topology of the solid — its vertex count, face count, edge count, face shape, and curvature type — is fully determined by just two numbers called the Harmonic Solid Factors:

  f1 = c − a   (difference factor)
  f2 = c + a   (sum factor)

These factors satisfy the fundamental identity f1×f2 = (c−a)(c+a) = c²−a² = b². This means the product of the two factors always equals the square of the middle leg.

The five-step construction (the complete Grant Projection Theorem):

  Step 1 — Recover the triangle from factors:
    a = (f2−f1)/2,  b = √(f1·f2),  c = (f1+f2)/2

  Step 2 — Vertex count:
    V = a + 2b + c

  Step 3 — Face type:
    k = 6 − (number of integer-valued sides among {a,b,c})
    For Pythagorean triples: all sides integer → k=3 (triangular faces)

  Step 4 — Face count:
    F = 2(V−2)/(k−2)

  Step 5 — Edge count:
    E = kF/2  (with V−E+F=2 guaranteed)

Why is this remarkable? From two numbers (f1,f2) — or equivalently from a right triangle — we completely determine a 3D polyhedron without any coordinate geometry. The triangle IS the polyhedron, in compressed form.

This gives an infinite family of polyhedra — one for each Pythagorean triple — extending far beyond the five Platonic and thirteen Archimedean solids.`,key_points:[`Harmonic Solid: generated from right triangle (a,b,c) via the Grant Projection Theorem.`,`Factors: f1=c−a, f2=c+a. Fundamental identity: f1×f2=b².`,`V=a+2b+c. For Pythagorean triples: k=3 (triangular faces).`,`F=2(V−2)/(k−2). E=kF/2. Euler: V−E+F=2.`,`Five steps from (f1,f2) → complete polyhedral topology. No coordinates needed.`,`Infinite family: every Pythagorean triple gives a unique Harmonic Solid.`],formulas:[{label:`Factors`,expression:`f1=c−a, f2=c+a, f1·f2=b²`,description:`The two harmonic solid factors and their fundamental identity.`},{label:`Vertex count`,expression:`V = a + 2b + c`,description:`Middle leg b counted twice for harmonic closure.`},{label:`Face type`,expression:`k = 6 − #{integer sides in {a,b,c}}`,description:`For Pythagorean triples: k=3 (all sides integer).`},{label:`Face count`,expression:`F = 2(V−2)/(k−2)`,description:`Corollary 4.1 of the Grant Projection Theorem.`},{label:`Edge count`,expression:`E = kF/2`,description:`With Euler's formula V−E+F=2 guaranteed.`}],worked_examples:[{title:`Complete topology of the (8,15,17) Archon Solid`,steps:[`a=8, b=15, c=17. Verify: 8²+15²=64+225=289=17². ✓`,`f1=17−8=9. f2=17+8=25. Verify: 9×25=225=15²=b². ✓`,`V=8+2(15)+17=8+30+17=55.`,`k=3 (all integers). F=2(55−2)/(3−2)=2(53)=106.`,`E=3×106/2=159.`,`Euler: 55−159+106=2. ✓`]},{title:`Recovery from factors: f1=9, f2=25`,steps:[`a=(f2−f1)/2=(25−9)/2=8.`,`b=√(f1·f2)=√(9×25)=√225=15.`,`c=(f1+f2)/2=(25+9)/2=17.`,`Triple (8,15,17). Check: 64+225=289=17². ✓`]}]},{id:`s2`,heading:`Section 2 — The Stellated Projection: Phase Conjugate of the Convex Form`,body:`Every Pythagorean triple generates not one but TWO distinct polyhedral structures. The convex projection (Lecture Section 1) uses (f1=c−a, f2=c+a) in additive mode. The stellated projection swaps the roles of f1 and f2:

  Stellated factors: f1_S = c+a,  f2_S = c−a

The stellated topology uses a completely different formula set:
  V_S = f1_S + f2_S = (c+a)+(c−a) = 2c
  E_S = f1_S × f2_S = (c+a)(c−a) = c²−a² = b²
  F_S = E_S − V_S + 2 = b² − 2c + 2

The two projections are called phase conjugates — related by the factor swap f1↔f2. The key invariant preserved under this swap: f1×f2=b² (unchanged whether you call them convex or stellated).

Interpretation:
  Convex: distributes harmonic content outward → smooth sphere-like solid.
  Stellated: concentrates harmonic content inward → dense, self-intersecting structure.

The stellated form typically violates the planar graph bound E≤3V−6, confirming its non-planar, self-intersecting nature.

For the Alphahedron (5,12,13):
  Convex: V=42, E=120, F=80.
  Stellated: V=2×13=26, E=12²=144, F=144−26+2=120.
  Planar bound: 3(26)−6=72. E=144>72. Violates. ✓ (non-planar)

Notably, F_stellated=120=5! for the Alphahedron — a beautiful coincidence.`,key_points:[`Stellated: swap f1↔f2. V_S=2c, E_S=b², F_S=b²−2c+2.`,`Invariant: f1·f2=b² preserved under the swap.`,`Convex: smooth, outward. Stellated: dense, self-intersecting.`,`Stellated usually violates E≤3V−6 (non-planar).`,`Alphahedron stellated: V=26, E=144, F=120=5!`,`Both projections give V−E+F=2 (Euler's formula holds for both).`],formulas:[{label:`Stellated vertex count`,expression:`V_S = 2c`,description:`Twice the hypotenuse.`},{label:`Stellated edge count`,expression:`E_S = b²`,description:`Square of the middle leg.`},{label:`Stellated face count`,expression:`F_S = b² − 2c + 2`,description:`From Euler's formula.`},{label:`Planar bound`,expression:`E ≤ 3V−6`,description:`Stellated solids usually violate this, confirming non-planar structure.`},{label:`Phase conjugate invariant`,expression:`f1·f2 = b² (preserved)`,description:`The only invariant under the convex↔stellated swap.`}],worked_examples:[{title:`Stellated (7,24,25) Heptahedron`,steps:[`V_S=2×25=50. E_S=24²=576. F_S=576−50+2=528.`,`Euler: 50−576+528=2. ✓`,`Planar bound: 3(50)−6=144. E=576>>144. Severely non-planar. ✓`,`f1×f2=(25−7)(25+7)=18×32=576=24²=b². ✓`]}]},{id:`s3`,heading:`Section 3 — The Alphahedron: The Central Harmonic Solid`,body:`The Alphahedron is the Harmonic Solid generated by the Pythagorean triple (5,12,13). It occupies a special place in the Grant framework for several reasons.

Complete topology:
  a=5, b=12, c=13. f1=8, f2=18. f1×f2=144=12². ✓
  V = 5+24+13 = 42 vertices.
  F = 2(42−2) = 80 faces.
  E = 3×80/2 = 120 edges.
  Euler: 42−120+80 = 2. ✓

The number 42: In the Grant framework, V=42 corresponds to the atomic number of Molybdenum (Z=42) in the periodic table mapping. It is also the famous answer in The Hitchhiker's Guide to the Galaxy — Grant has noted this as a harmonic coincidence.

F=80 and F=120 connection: the convex form has F=80 faces and E=120 edges. The stellated form has F=120=5! faces. Both 80 and 120 appear.

The characteristic angle: θ=arctan(a/b)=arctan(5/12)≈22.62°. This is the fundamental geometric angle of the Alphahedron.

The Alphahedron as the Philosopher's Stone: In Grant's symbolic framework, the (5,12,13) Alphahedron is associated with the alchemical Philosopher's Stone — the transformative agent that bridges material and spiritual dimensions. Mathematically, the 5-fold symmetry of its generating seed connects it to the golden ratio (pentagon has diagonal/side=φ) and hence to life, growth, and reproduction patterns.

Curvature: F/V=80/42≈1.905 < 6 → positive (spherical) curvature. The Alphahedron curves back on itself, forming a closed spherical topology.

The consecutive-leg family produces a sequence of Alphahedra-type solids:
  n=1: (3,4,5) → V=16, F=28, E=42
  n=2: (5,12,13) → V=42, F=80, E=120  ← The Alphahedron
  n=3: (7,24,25) → V=80, F=156, E=234
  n=4: (9,40,41) → V=130, F=256, E=384
  n=5: (11,60,61) → V=192, F=380, E=570`,key_points:[`Alphahedron: (5,12,13) → V=42, F=80, E=120. f1=8, f2=18.`,`F=5! in the stellated form (F_S=120). Convex E=120.`,`Characteristic angle: arctan(5/12)≈22.62°.`,`V=42: Molybdenum (Z=42) in periodic table mapping.`,`Curvature: F/V≈1.905 < 6 → positive (spherical).`,`Consecutive-leg family: n=2 gives the Alphahedron. n=1,3,4,5 give the extended family.`],formulas:[{label:`Alphahedron topology`,expression:`V=42, F=80, E=120 (from triple (5,12,13))`,description:`The complete Alphahedron vertex-face-edge count.`},{label:`Alphahedron factors`,expression:`f1=8, f2=18, f1·f2=144=12²`,description:`Harmonic Solid Factors of the (5,12,13) triple.`},{label:`Characteristic angle`,expression:`θ = arctan(5/12) ≈ 22.62°`,description:`The fundamental geometric angle of the Alphahedron.`},{label:`Consecutive-leg family`,expression:`(a_n,b_n,c_n) = (2n+1, 2n(n+1), 2n(n+1)+1)`,description:`n=2 gives the Alphahedron. n=1,3,4,5 give related solids.`}],worked_examples:[{title:`Consecutive-leg family n=3: the Heptahedron`,steps:[`n=3: a=2(3)+1=7, b=2(3)(4)=24, c=24+1=25.`,`Check: 7²+24²=49+576=625=25². ✓`,`f1=2n²=18, f2=2(n+1)²=32. f1×f2=576=24²=b². ✓`,`V=7+48+25=80. F=2(78)=156. E=234. Euler: 80−234+156=2. ✓`]}]},{id:`s4`,heading:`Section 4 — The Cascade Ratio and Nine Harmonic Means`,body:`From the generating triangle (a,b,c), the Harmonic Solid framework defines nine radii that locate the vertices in concentric shells. These come from the nine generative means — a set of nine distinct ways to compute averages from the sides.

The three classical means:
  AM = c  (Arithmetic Mean = hypotenuse)
  GM = b  (Geometric Mean = middle leg)
  HM = b²/c  (Harmonic Mean — satisfies 1/HM = (1/AM+1/GM+...)/3 weighting)

Verify the key mean identity: GM² = AM × HM → b² = c × (b²/c) = b². ✓

The cascade ratio: r = c/b = AM/GM. This ratio controls how quickly the harmonic shells expand outward from the center:
  Shell 0 (reference): radius = b = GM
  Shell +1 (outward): radius = b×r = b×(c/b) = c = AM
  Shell +2: radius = b×r² = c²/b = QM (Quadratic Mean)
  Shell −1 (inward): radius = b/r = b×(b/c) = b²/c = HM
  Shell −2: radius = b/r² = b³/c² = DHM (Double Harmonic Mean)

The radial positions form a geometric sequence: R_n = b·r^n = b·(c/b)^n.

For the Alphahedron (5,12,13): r=13/12≈1.0833. Shells:
  GM=12, AM=13, HM=144/13≈11.077, QM=12×√(13/12)≈12.49

For the (3,4,5) solid: r=5/4=1.25. Shells:
  GM=4, AM=5, HM=16/5=3.2.

The nine means span three groups:
  Inner core:  DHM, DQM, DM   (tightest, innermost)
  Middle core: HM,  GM,  AM   (the classical three)
  Outer shells: QM, LBM, LGM  (expanded, outermost)`,key_points:[`AM=c, GM=b, HM=b²/c. Key identity: GM²=AM×HM (always).`,`Cascade ratio r=c/b=AM/GM. Controls shell spacing.`,`Shell radii: R_n=b·(c/b)^n. Geometric sequence with ratio r.`,`R_0=b(GM), R_1=c(AM), R_{-1}=b²/c(HM).`,`Nine means span from DHM (innermost) to LGM (outermost).`,`For (5,12,13): r=13/12≈1.083. For (3,4,5): r=5/4=1.25.`],formulas:[{label:`Three classical means`,expression:`AM=c, GM=b, HM=b²/c`,description:`From the generating triangle sides.`},{label:`Key identity`,expression:`GM² = AM × HM → b² = c × (b²/c)`,description:`Geometric mean squared = arithmetic × harmonic.`},{label:`Cascade ratio`,expression:`r = c/b = AM/GM = GM/HM`,description:`Equal ratio between consecutive means — a geometric sequence.`},{label:`Shell radii`,expression:`R_n = b · (c/b)^n = b · r^n`,description:`Radial position of n-th shell.`}],worked_examples:[{title:`Cascade ratio and shells for (8,15,17)`,steps:[`r=17/15≈1.1333.`,`R_0=GM=15. R_1=AM=17. R_{-1}=HM=15²/17=225/17≈13.235.`,`Check: GM²=AM×HM → 225=17×(225/17)=225. ✓`,`R_2=b×r²=15×(17/15)²=15×289/225=289/15≈19.267.`]}]},{id:`s5`,heading:`Section 5 — Higher-Dimensional Geometry: 4D Polytopes`,body:`The Harmonic Solid framework extends naturally to four (and higher) dimensions. The 4D analogues of polyhedra are called polytopes (or polychora).

In 4D, a polytope has:
  V vertices (0D cells)
  E edges (1D cells)
  F faces (2D cells)
  C cells (3D cells — the 4D equivalent of faces)

The 4D Euler relation: V − E + F − C = 0 (compare 3D: V−E+F=2).

The six regular 4D polytopes (analogues of the five Platonic solids):

  Name               V      E     F     C    3D-cell type
  5-cell             5      10    10    5    tetrahedra
  Tesseract (4-cube) 16     32    24    8    cubes
  16-cell            8      24    32    16   tetrahedra
  24-cell            24     96    96    24   octahedra
  120-cell           600    1200  720   120  dodecahedra
  600-cell           120    720   1200  600  tetrahedra

All satisfy V−E+F−C=0. Verify tesseract: 16−32+24−8=0. ✓

Dual pairs (V↔C, E and F may swap):
  5-cell: self-dual.
  Tesseract ↔ 16-cell: V↔C (16↔8), E (32↔24), F (24↔32).
  24-cell: self-dual.
  120-cell ↔ 600-cell: V↔C (600↔120), E (1200↔720), F (720↔1200).

Hypercube in n dimensions: V=2^n, E=n×2^(n−1), F_k=C(n,k)×2^(n−k).
  n=3 (cube): V=8, E=12. n=4 (tesseract): V=16, E=32. n=5: V=32, E=80.

The Harmonic Solid framework aims to generate 4D structures from Pythagorean triples by the same algebraic projection — work in progress in Grant's framework.`,key_points:[`4D polytopes: V vertices, E edges, F faces, C cells. Euler: V−E+F−C=0.`,`Six regular 4D polytopes (vs 5 Platonic solids in 3D).`,`Tesseract: V=16,E=32,F=24,C=8. Verify: 16−32+24−8=0. ✓`,`Dual pairs: Tesseract↔16-cell; 120-cell↔600-cell; 5-cell and 24-cell self-dual.`,`Hypercube: V=2^n, E=n×2^(n−1). Grows exponentially with dimension.`,`24-cell is unique: self-dual with all octahedral cells — no 3D analogue.`],formulas:[{label:`4D Euler relation`,expression:`V − E + F − C = 0`,description:`The 4D analogue of V−E+F=2.`},{label:`n-D hypercube vertices`,expression:`V = 2^n`,description:`Exponential growth with dimension.`},{label:`n-D hypercube edges`,expression:`E = n × 2^(n−1)`,description:`Each vertex connects to n neighbors.`},{label:`5-cell`,expression:`V=5, E=10, F=10, C=5. V−E+F−C=0.`,description:`The simplest 4D regular polytope.`},{label:`Tesseract`,expression:`V=16, E=32, F=24, C=8. V−E+F−C=0.`,description:`The 4D hypercube.`}],worked_examples:[{title:`Verify the 600-cell: V=120, E=720, F=1200, C=600`,steps:[`V−E+F−C = 120−720+1200−600 = 0. ✓`,`Dual: 120-cell has V=600=C of 600-cell. 600-cell has V=120=C of 120-cell. ✓`,`Both share E (total edges): 120-cell E=1200, 600-cell E=720. These are different (not equal).`,`Actually: 120-cell (V=600,E=1200,F=720,C=120) ↔ 600-cell (V=120,E=720,F=1200,C=600). Note F and E also swap.`]}]},{id:`s6`,heading:`Section 6 — Curvature, Golden Asymmetry, and Surface Area`,body:`The Harmonic Solid framework classifies all its solids by curvature type — a property that tells us whether the solid curves like a sphere (positive), like a flat plane (zero), or like a saddle (negative).

Curvature from faces per vertex:
  faces/vertex < 6: Positive (spherical) curvature
  faces/vertex = 6: Zero (Euclidean, flat) curvature
  faces/vertex > 6: Negative (hyperbolic) curvature

For the Alphahedron: F/V = 80/42 ≈ 1.905 < 6 → spherical. ✓
For any triangular-faced Harmonic Solid: F/V = 2(V−2)/V = 2−4/V → 2 as V→∞. Always < 6 → always spherical!

Golden Asymmetry: unlike Platonic solids (which have exact rotational symmetry), Harmonic Solids built from scalene triangles (a≠b≠c, all different) have no perfect symmetry axes. This asymmetry is the key to their role in modeling natural structures: crystals, DNA, galaxies — all exhibit broken symmetry. The asymmetry parameter can be measured by:
  Asymmetry = |f2−f1| / |f2+f1| = 2a/(2c) = a/c
  For (3,4,5): 3/5=0.6. For (5,12,13): 5/13≈0.385. For (7,24,25): 7/25=0.28.
As n increases in the consecutive-leg family, a/c → 0 (more symmetric).

Surface area of Platonic solids (edge length=1):
  Tetrahedron: A=4√3 ≈ 6.928,  V=(1/12)√2 ≈ 0.1178
  Cube:        A=6,             V=1
  Octahedron:  A=2√3 ≈ 3.464,  V=(√2)/3 ≈ 0.4714
  Dodecahedron: A≈20.646,      V≈7.663
  Icosahedron: A=5√3 ≈ 8.660,  V≈2.182

Sphere (the limit of harmonic solids as faces → ∞):
  A=4πr². V=(4/3)πr³. For r=1: A=4π≈12.566, V=4π/3≈4.189.`,key_points:[`Curvature: F/V<6 spherical, =6 flat, >6 hyperbolic.`,`All triangular-faced Harmonic Solids: F/V→2 as V→∞ → always spherical.`,`Golden Asymmetry: Harmonic Solids are scalene → no perfect symmetry.`,`Asymmetry = a/c. Consecutive-leg family: a/c→0 (more symmetric at large n).`,`Platonic surface areas: Cube=6, Icosahedron=5√3≈8.660.`,`Sphere = limiting case: A=4πr², V=(4/3)πr³.`],formulas:[{label:`Curvature rule`,expression:`F/V < 6 → spherical; =6 → flat; >6 → hyperbolic`,description:`Determined by the ratio of faces to vertices.`},{label:`Asymmetry parameter`,expression:`asymmetry = a/c = (f2−f1)/(f1+f2)`,description:`Measures deviation from symmetric (isosceles) form.`},{label:`Tetrahedron surface area`,expression:`A = 4√3 ≈ 6.928 (edge=1)`,description:`Sum of four equilateral triangles.`},{label:`Sphere`,expression:`A=4πr², V=(4/3)πr³`,description:`The geometric limit of harmonic solids.`}],worked_examples:[{title:`Asymmetry of (3,4,5) vs (11,60,61)`,steps:[`(3,4,5): a/c=3/5=0.6 (high asymmetry).`,`(11,60,61): a/c=11/61≈0.180 (low asymmetry).`,`The (11,60,61) solid is more 'symmetric' — its generating triangle is more nearly isosceles.`,`As n→∞ in the consecutive-leg family: a_n/c_n=(2n+1)/(2n(n+1)+1)→0. Approaches perfect symmetry.`]}]}],l={key_takeaways:[`Harmonic Solid from (a,b,c): f1=c−a, f2=c+a, f1·f2=b². V=a+2b+c. F=2(V−2). E=3F/2.`,`Stellated: V_S=2c, E_S=b², F_S=b²−2c+2. Invariant: f1·f2=b² preserved.`,`Alphahedron (5,12,13): V=42, F=80, E=120. Stellated F=120=5!. Angle=22.62°.`,`Cascade ratio r=c/b. Nine shells: R_n=b·r^n. GM²=AM×HM always.`,`4D polytopes: V−E+F−C=0. Six regular types. Tesseract V=16, C=8.`,`Curvature: F/V<6 (spherical). Asymmetry=a/c decreases along consecutive-leg family.`,`The Grant Projection Theorem: from (f1,f2) alone, complete topology in 5 steps.`],core_formulas:[{label:`Factors`,expression:`f1=c−a, f2=c+a, f1·f2=b²`},{label:`Convex topology`,expression:`V=a+2b+c; F=2(V−2); E=3F/2`},{label:`Stellated topology`,expression:`V_S=2c; E_S=b²; F_S=b²−2c+2`},{label:`Cascade ratio`,expression:`r=c/b; R_n=b·r^n`},{label:`4D Euler`,expression:`V−E+F−C=0`},{label:`Curvature`,expression:`F/V<6→spherical; all triangular HSolids are spherical`}]},u=[{question:`Complete the topology of the (20,21,29) Icosian Solid: find V, F, E.`,answer:`V=20+42+29=91. Wait: V=20+2(21)+29=20+42+29=91. F=2(91−2)=178. E=3×178/2=267. Euler: 91−267+178=2. ✓`,difficulty:`hard`},{question:`For triple (8,15,17): f1=9, f2=25. Verify f1×f2=b².`,answer:`9×25=225=15²=b². ✓`,difficulty:`easy`},{question:`Stellated (9,40,41): find V_S, E_S, F_S.`,answer:`V_S=2×41=82. E_S=40²=1600. F_S=1600−82+2=1520. Euler: 82−1600+1520=2. ✓`,difficulty:`medium`},{question:`For (5,12,13): what is the cascade ratio r=c/b and what is the HM?`,answer:`r=13/12≈1.0833. HM=b²/c=144/13≈11.077.`,difficulty:`medium`},{question:`Verify the 4D Euler relation for the 24-cell: V=24, E=96, F=96, C=24.`,answer:`V−E+F−C=24−96+96−24=0. ✓`,difficulty:`easy`},{question:`What is the asymmetry parameter a/c for the Alphahedron (5,12,13)?`,answer:`a/c=5/13≈0.385.`,difficulty:`easy`},{question:`In the consecutive-leg family, which n gives V=80?`,answer:`n=3: (7,24,25). V=7+48+25=80. ✓`,difficulty:`medium`}],d={id:e,title:t,subtitle:n,source_document:r,lecture_number:1,total_lectures:1,estimated_reading_minutes:35,overview:s,sections:c,summary:l,review_questions:u};export{d as default,o as estimated_reading_minutes,e as id,i as lecture_number,s as overview,u as review_questions,c as sections,r as source_document,n as subtitle,l as summary,t as title,a as total_lectures};