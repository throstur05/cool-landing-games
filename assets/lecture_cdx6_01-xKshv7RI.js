var e=`lecture_cdx6_01`,t=`Codex New Math 6 — Classic Geometry: Platonic Solids, Archimedean Solids, and Sacred Geometry`,n=`The Five Platonic Solids · All 13 Archimedean Solids · Classical 2D Shapes · Sacred Geometry · Old vs New`,r=`Codex Universalis — Classical and Sacred Geometry Overview`,i=1,a=1,o=32,s=`This lecture covers the foundational classical geometry that underpins Western tradition and sacred geometry: the five Platonic solids with their precise topology, surface areas, and volumes; all 13 Archimedean solids; the classical 2D shapes (circle, triangle, square, pentagon, hexagon) with their complete formulae; sacred geometry extensions (Vesica Piscis, Flower of Life, Metatron's Cube, Torus); and the contrast between old (static, symmetric) and new (dynamic, recursive) geometry. Every result is exactly calculable.`,c=[{id:`s1`,heading:`Section 1 — The Five Platonic Solids: Perfect Regularity`,body:`The Platonic solids are the five convex polyhedra where every face is an identical regular polygon and every vertex is identical. Euclid proved these are the ONLY such solids — a remarkable completeness theorem.

Complete table:

  Solid          V   E   F  faces/vertex  face type   element
  Tetrahedron    4   6   4      3         triangles    Fire
  Cube           8  12   6      3         squares      Earth
  Octahedron     6  12   8      4         triangles    Air
  Dodecahedron  20  30  12      3         pentagons    Ether/Cosmos
  Icosahedron   12  30  20      5         triangles    Water

All five satisfy Euler's formula V−E+F=2.

Dual pairs: The cube and octahedron are duals (swap V and F). The dodecahedron and icosahedron are duals. The tetrahedron is self-dual.

Dihedral angles (angle between adjacent faces):
  Tetrahedron: arccos(1/3)≈70.53°
  Cube: 90° exactly
  Octahedron: arccos(−1/3)≈109.47°
  Dodecahedron: arctan(2)≈116.57°
  Icosahedron: arctan(2)×... ≈138.19°

Surface areas (edge a=1):
  Tetrahedron: SA=√3≈1.732  (4 equilateral triangles)
  Cube: SA=6                 (6 unit squares)
  Octahedron: SA=2√3≈3.464  (8 equilateral triangles)
  Dodecahedron: SA≈20.646   (12 regular pentagons)
  Icosahedron: SA=5√3≈8.660 (20 equilateral triangles)

Volumes (edge a=1):
  Tetrahedron: V=1/(6√2)≈0.1178
  Cube: V=1
  Octahedron: V=√2/3≈0.4714
  Dodecahedron: V=(15+7√5)/4≈7.663
  Icosahedron: V=5(3+√5)/12≈2.182

Golden ratio connections: Both the dodecahedron and icosahedron are built from golden ratio geometry. The icosahedron's vertices can be described using three mutually perpendicular golden rectangles (1:φ). The dodecahedron's face diagonals are in ratio φ to its edge length.`,key_points:[`Exactly 5 Platonic solids exist — proven by Euclid. No more, no fewer.`,`All satisfy V−E+F=2. Dual pairs: Cube↔Octahedron, Dodecahedron↔Icosahedron, Tetrahedron self-dual.`,`Elements: Tetrahedron=Fire, Cube=Earth, Octahedron=Air, Dodecahedron=Ether, Icosahedron=Water.`,`Most faces: Icosahedron (F=20). Most vertices: Dodecahedron (V=20). Shared E=30.`,`Surface areas: SA=k×(√3/4) for triangular-faced solids (k=4,8,20 for tetra, octa, icosa).`,`Golden ratio: Icosahedron built from 3 golden rectangles. Dodecahedron face diagonals = φ×edge.`],formulas:[{label:`Euler's formula`,expression:`V − E + F = 2 (all Platonic solids)`,description:`Verified for all 5.`},{label:`Tetrahedron SA`,expression:`SA = a²√3 (4 equilateral triangles)`,description:`Each triangle area = (√3/4)a².`},{label:`Cube SA/V`,expression:`SA=6a², V=a³`,description:`The simplest solid.`},{label:`Octahedron SA`,expression:`SA = 2a²√3 (8 equilateral triangles)`,description:`Dual of cube.`},{label:`Icosahedron SA`,expression:`SA = 5a²√3 (20 equilateral triangles)`,description:`Maximum triangular faces.`},{label:`Dual relationship`,expression:`V(solid) = F(dual), F(solid) = V(dual), E same`,description:`Swapping vertices and faces gives the dual solid.`}],worked_examples:[{title:`Verify Euler's formula for all five Platonic solids`,steps:[`Tetrahedron: V-E+F=4-6+4=2. ✓`,`Cube: V-E+F=8-12+6=2. ✓`,`Octahedron: V-E+F=6-12+8=2. ✓`,`Dodecahedron: V-E+F=20-30+12=2. ✓`,`Icosahedron: V-E+F=12-30+20=2. ✓`,`All five check out — Euler's formula is universal for convex polyhedra.`]},{title:`Verify the cube-octahedron dual pair`,steps:[`Cube: V=8, F=6, E=12.`,`Octahedron: V=6, F=8, E=12.`,`V(cube)=8=F(octa): ✓. F(cube)=6=V(octa): ✓. E both=12: ✓.`,`Place an octahedron inside a cube, with one octahedron vertex at the center of each cube face. They are geometrically dual.`]}]},{id:`s2`,heading:`Section 2 — All 13 Archimedean Solids`,body:`Archimedean solids have two or more types of regular polygon faces, with identical vertex figures (the same arrangement of face types at every vertex). There are exactly 13 (plus two infinite families of prisms and antiprisms).

Complete list:

  Name                         V    E    F    Faces
  Truncated Tetrahedron       12   18    8    4 triangles + 4 hexagons
  Cuboctahedron               12   24   14    8 triangles + 6 squares
  Truncated Cube              24   36   14    8 triangles + 6 octagons
  Truncated Octahedron        24   36   14    6 squares + 8 hexagons
  Rhombicuboctahedron         24   48   26    8 triangles + 18 squares
  Truncated Cuboctahedron     48   72   26    12 sq + 8 hex + 6 oct
  Snub Cube*                  24   60   38    32 triangles + 6 squares
  Icosidodecahedron           30   60   32    20 triangles + 12 pentagons
  Truncated Dodecahedron      60   90   32    20 triangles + 12 decagons
  Truncated Icosahedron       60   90   32    12 pentagons + 20 hexagons
  Rhombicosidodecahedron      60  120   62    20 tri + 30 sq + 12 pent
  Truncated Icosidodecahedron 120  180   62    30 sq + 20 hex + 12 dec
  Snub Dodecahedron*          60  150   92    80 triangles + 12 pentagons

*Chiral: the snub cube and snub dodecahedron come in mirror-image pairs.

All satisfy V−E+F=2. The Truncated Icosahedron (soccer ball) with its 12 pentagons and 20 hexagons is perhaps the most familiar — also the structure of Buckminster Fullerene (C₆₀).

The Cuboctahedron (vector equilibrium) is unique: all 12 vertices are equidistant from the center, and it is the configuration where all forces balance — hence 'vector equilibrium'.

The largest Archimedean solid is the Truncated Icosidodecahedron with V=120, E=180, F=62 — containing squares, hexagons, and decagons.`,key_points:[`Exactly 13 Archimedean solids (plus prism/antiprism infinite families).`,`All satisfy V−E+F=2.`,`Snub cube and snub dodecahedron are chiral — each has two non-superimposable mirror forms.`,`Truncated Icosahedron: 12 pentagons + 20 hexagons = soccer ball = C₆₀ Fullerene.`,`Cuboctahedron (vector equilibrium): V=12, all vertices equidistant from center.`,`Largest: Truncated Icosidodecahedron, V=120, E=180, F=62.`],formulas:[{label:`Truncated Icosahedron`,expression:`V=60, E=90, F=32 (12 pent+20 hex)`,description:`The soccer ball / C₆₀ Buckyball structure.`},{label:`Cuboctahedron`,expression:`V=12, E=24, F=14 (8 tri+6 sq)`,description:`The vector equilibrium.`},{label:`Snub Cube`,expression:`V=24, E=60, F=38 (32 tri+6 sq) — chiral`,description:`Exists in left- and right-handed forms.`},{label:`Truncated Icosidodecahedron`,expression:`V=120, E=180, F=62 (30 sq+20 hex+12 dec)`,description:`Largest Archimedean solid.`}],worked_examples:[{title:`Verify Euler for the Truncated Icosahedron (soccer ball)`,steps:[`V=60, E=90, F=32.`,`V-E+F=60-90+32=2. ✓`,`Face check: 12 pentagons + 20 hexagons = 32. ✓`,`Edge check: Each pentagon has 5 edges, each hexagon has 6 edges. Each edge shared by 2 faces.`,`E=(12×5+20×6)/2=(60+120)/2=90. ✓`]}]},{id:`s3`,heading:`Section 3 — Classical 2D Shapes: Circle, Triangle, Square, Pentagon, Hexagon`,body:`The classical 2D shapes are the foundational forms of sacred geometry, each carrying symbolic weight across cultures.

CIRCLE — The Monad:
  Area: A=πr². Circumference: C=2πr.
  Sector area: A=(1/2)r²θ (θ in radians). Arc length: s=rθ.
  The circle has infinite lines of symmetry and infinite rotational symmetry.
  Symbolic: infinity, unity, cycles, the divine — the point expanded.

EQUILATERAL TRIANGLE — The Trinity:
  Area: A=(√3/4)s². Height: h=(√3/2)s.
  Interior angles: all 60°. Sum: 180°.
  3 lines of symmetry, rotational order 3.
  Symbolic: trinity, stability, fire, ascent. First closed polygon.

SQUARE — The Earth Form:
  Area: A=s². Perimeter: P=4s. Diagonal: d=s√2.
  Interior angles: all 90°. Sum: 360°.
  4 lines of symmetry, rotational order 4.
  Symbolic: earth, matter, foundation, four directions.

REGULAR PENTAGON — Life and the Golden Ratio:
  Area: A=(s²/4)√(25+10√5)≈1.720s².
  Interior angle: 108°. Sum: 540°.
  Diagonal/side = φ (golden ratio ≈ 1.618).
  5 lines of symmetry, rotational order 5.
  Symbolic: life, growth, the human form (Vitruvian Man), nature's pattern.

REGULAR HEXAGON — Harmony and Efficiency:
  Area: A=(3√3/2)s²≈2.598s².
  Interior angle: 120°. Sum: 720°.
  Long diagonal: 2s. Short diagonal: s√3.
  6 lines of symmetry, rotational order 6.
  Composed of 6 equilateral triangles.
  Most space-efficient polygon for tiling the plane (hexagonal packing density ≈ 90.69%).
  Symbolic: harmony, efficiency, nature (honeycomb), balance.

GENERAL FORMULA — Regular n-gon:
  Interior angle: (n-2)×180°/n
  Interior angle sum: (n-2)×180°
  Area: A=(ns²)/(4tan(π/n))
  Lines of symmetry: n. Rotational order: n.`,key_points:[`Circle: A=πr², C=2πr, arc=rθ, sector=(1/2)r²θ. Infinite symmetry.`,`Triangle: A=(√3/4)s², h=(√3/2)s. Interior angles: 60° each.`,`Square: A=s², diagonal=s√2. Interior angles: 90° each.`,`Pentagon: interior angle=108°. Diagonal=s×φ. Five-fold golden ratio geometry.`,`Hexagon: A=(3√3/2)s². Interior angle=120°. = 6 equilateral triangles.`,`General n-gon: area=(ns²)/(4tan(π/n)). Interior angle=(n-2)×180°/n.`],formulas:[{label:`Circle`,expression:`A=πr², C=2πr, sector=(1/2)r²θ, arc=rθ`,description:`The fundamental closed curve.`},{label:`Equilateral triangle`,expression:`A=(√3/4)s², h=(√3/2)s, angles=60°`,description:`The Trinity form.`},{label:`Square diagonal`,expression:`d = s√2`,description:`From Pythagoras: d²=s²+s².`},{label:`Pentagon diagonal`,expression:`diagonal = s×φ = s×(1+√5)/2`,description:`The golden ratio emerges from the pentagon.`},{label:`Hexagon area`,expression:`A=(3√3/2)s² = 6×(√3/4)s²`,description:`Six equilateral triangles.`},{label:`Regular n-gon area`,expression:`A=(ns²)/(4tan(π/n))`,description:`General formula for any regular polygon.`}],worked_examples:[{title:`Pentagon diagonal proves the golden ratio`,steps:[`In a regular pentagon with side s=1, draw a diagonal d.`,`The diagonal cuts the pentagon into a triangle and a trapezoid.`,`The triangle is a 'golden gnomon' (36-72-72 angles).`,`In this triangle: d/s = s/(d-s). Let d/s=x. Then x=1/(x-1), so x(x-1)=1, x²-x-1=0.`,`x=(1+√5)/2=φ. ✓ The golden ratio emerges purely from the pentagon's geometry.`]},{title:`Hexagonal tiling efficiency`,steps:[`In hexagonal packing, each circle of radius r has a hexagon of side r around it.`,`Hexagon area = (3√3/2)r². Circle area = πr².`,`Packing efficiency = πr²/((3√3/2)r²) = π/(3√3/2) = 2π/(3√3) = π/√12 ≈ 0.9069.`,`≈90.69% coverage. Bees figured this out millions of years before mathematicians proved it was optimal.`]}]},{id:`s4`,heading:`Section 4 — Sacred Geometry: Vesica Piscis, Flower of Life, Torus, Metatron's Cube`,body:`Sacred geometry extends classical Euclidean forms into symbolic and metaphysical territory. While the philosophical claims are matters of tradition and interpretation, the underlying mathematics is precise and calculable.

VESICA PISCIS:
Two overlapping circles of equal radius r, with centers spaced r apart. The lens-shaped overlap is the Vesica Piscis.
  Height of lens = 2r (= diameter of each circle)
  Width of lens = r√3 (from the 30-60-90 triangle formed by the intersection)
  Height/Width ratio = 2/√3 = 2√3/3 ≈ 1.1547
  This ratio is the same as 2:√3 found in the 30-60-90 triangle.
Symbolic: creation, duality, the womb, the union of two circles.

FLOWER OF LIFE:
Seven circles of equal radius arranged with one central and six in the first ring (at 60° intervals), then extending outward. The first ring contains exactly 6 circles because 360°/60°=6, and adjacent circles touch at exactly one point.
  Circles in ring k: 6k (for k≥1). Total through ring k: 1+3k(k+1).
  The 'Fruit of Life' uses 13 specific circles from the Flower of Life.
Symbolic: the blueprint of creation, universal pattern.

METATRON'S CUBE:
Constructed by connecting the centers of all 13 circles in the Fruit of Life. The resulting figure contains within it all 5 Platonic solids as 2D projections.
  Lines in Metatron's Cube: 78 (connecting 13 nodes pairwise: C(13,2)=78).
Symbolic: contains all Platonic forms, the geometry of consciousness.

TORUS:
A donut-shaped surface of revolution, characterized by major radius R (from center of tube to center of torus) and minor radius r (tube radius).
  Surface area: SA=4π²Rr
  Volume: V=2π²Rr²
  The torus is significant in physics: electromagnetic fields form toroidal patterns, as do many stable energy configurations.
Symbolic: energy loops, breath circuits, consciousness cycles.`,key_points:[`Vesica Piscis: two circles of radius r, centers r apart. Width=r√3, Height=2r, ratio=2/√3.`,`Flower of Life: 6 circles in first ring (360°/60°=6). 13 circles in the Fruit of Life.`,`Metatron's Cube: 78 lines connecting 13 nodes (C(13,2)=78). Contains all 5 Platonic projections.`,`Torus: SA=4π²Rr. Volume=2π²Rr². Major radius R, minor radius r.`,`Hexagonal circle packing: density=π/√12≈90.69% (maximum possible in 2D).`,`Pentagon encodes φ: diagonal/side=φ. Pentagram intersections all in golden ratio.`],formulas:[{label:`Vesica Piscis width`,expression:`width = r√3 (where r = circle radius = center spacing)`,description:`From 30-60-90 triangle geometry.`},{label:`Vesica Piscis ratio`,expression:`height/width = 2r/(r√3) = 2/√3 ≈ 1.1547`,description:`The fundamental ratio of the Vesica Piscis.`},{label:`Torus surface area`,expression:`SA = 4π²Rr`,description:`R = major radius, r = minor (tube) radius.`},{label:`Torus volume`,expression:`V = 2π²Rr²`,description:`Volume of the toroidal shape.`},{label:`Metatron's lines`,expression:`C(13,2) = 13×12/2 = 78 lines`,description:`All pairwise connections between 13 nodes.`}],worked_examples:[{title:`Vesica Piscis with r=3`,steps:[`Two circles of radius 3, centers 3 apart.`,`Width = 3×√3 ≈ 5.196.`,`Height = 2×3 = 6.`,`Ratio = 6/5.196 = 2/√3 ≈ 1.1547.`,`The intersection points are at the vertices of two equilateral triangles sharing the connecting segment.`]},{title:`Torus with R=5, r=2`,steps:[`SA = 4π²×5×2 = 40π² ≈ 394.78.`,`V = 2π²×5×4 = 40π² ≈ 394.78.`,`Interesting: for R=5, r=2, SA=V (numerically equal here by coincidence).`,`General condition SA=V: 4π²Rr=2π²Rr² → 2=r. Whenever r=2, SA=V.`]}]},{id:`s5`,heading:`Section 5 — Old Geometry vs New Geometry: The Contrast`,body:`The Codex makes an explicit contrast between classical geometry and the harmonic solid framework.

CLASSICAL (OLD) GEOMETRY:
  - Static: shapes are fixed, defined by exact symmetry.
  - Symmetric: the Platonic solids have the highest possible symmetry groups.
  - Closed: finite number of forms (5 Platonic, 13 Archimedean).
  - Integer-based: all V, E, F are determined by small integers.
  - Foundation: the bedrock on which Western mathematics, architecture, and science are built.

NEW (HARMONIC SOLID) GEOMETRY:
  - Dynamic: each Pythagorean triple generates a new form — infinite family.
  - Asymmetric: Harmonic Solids from scalene triangles have no rotational symmetry.
  - Open: unbounded — infinitely many Pythagorean triples → infinitely many Harmonic Solids.
  - Ratio-based: properties governed by cascade ratio r=c/b and golden asymmetry a/c.
  - Extension: built on the Pythagorean foundation, projecting into higher-dimensional harmonic structure.

HOW THEY CONNECT:
  The Platonic solids all satisfy V−E+F=2 — the same Euler formula that governs Harmonic Solids.
  The Alphahedron (5,12,13) → V=42, F=80, E=120 is not a Platonic or Archimedean solid, but obeys the same topological laws.
  Matching criterion: a Harmonic Solid can generate a Platonic or Archimedean solid if a+2b+c=V and the face type k matches. Example: could (a,b,c) give the cuboctahedron (V=12, k=3 or 4)?
    Need a+2b+c=12 and valid Pythagorean. Check (1,1,√2): non-integer b. Fails integer test → k≠3.
  The icosahedron IS constructable from golden rectangles (involving φ=1.618), directly connecting classical and harmonic geometry through the golden ratio.

IN PRACTICE:
  Classical shapes are the architectural vocabulary: the circle plans a dome, the square plans a floor, the pentagon organizes a garden, the hexagon tiles a bathroom.
  Harmonic solids extend this vocabulary into biological and quantum scales — the Alphahedron models molecular structures, the consecutive-leg family maps to the periodic table.`,key_points:[`Classical: 5 Platonic + 13 Archimedean = finite, closed, perfectly symmetric.`,`Harmonic Solids: infinite family, asymmetric, generated from Pythagorean triples.`,`Both governed by Euler's formula V−E+F=2.`,`Connection: icosahedron built from golden rectangles (φ). Dodecahedron face diagonals = φ×edge.`,`Classical = foundation (static, symmetric). New = extension (dynamic, recursive).`,`Practical: classical shapes for architecture; harmonic solids for molecular/biological/quantum scales.`],formulas:[{label:`Euler (universal)`,expression:`V − E + F = 2 (all convex polyhedra)`,description:`The single topological law governing both classical and harmonic solids.`},{label:`Golden icosahedron`,expression:`3 golden rectangles (1:φ) → 12 icosahedron vertices`,description:`The icosahedron emerges from φ geometry.`},{label:`Classical asymmetry parameter`,expression:`asymmetry = 0 (Platonic: all faces identical)`,description:`Versus Harmonic Solid asymmetry = a/c > 0.`}],worked_examples:[{title:`Can a Harmonic Solid match the cuboctahedron (V=12)?`,steps:[`Cuboctahedron: V=12, E=24, F=14, faces = 8 triangles + 6 squares.`,`For a Harmonic Solid with triangular faces (k=3): F=2(V-2)=20. But F=14≠20. Fails.`,`For k=4 (square faces): F=2(V-2)/(4-2)=10. Still ≠14. Fails.`,`The cuboctahedron mixes face types, so no single-k formula applies.`,`Conclusion: the cuboctahedron is not a pure Harmonic Solid. It exists at the boundary between the classical and harmonic frameworks.`]}]},{id:`s6`,heading:`Section 6 — Schläfli Symbols and Classification`,body:`The Schläfli symbol is a compact notation for regular polytopes, invented by Ludwig Schläfli in the 19th century.

For regular polygons: {p} means a regular p-sided polygon.
  {3}=triangle, {4}=square, {5}=pentagon, {6}=hexagon, {∞}=infinite line.

For regular polyhedra: {p,q} means q regular p-gons meet at each vertex.
  {3,3}=tetrahedron (3 triangles/vertex)
  {4,3}=cube (3 squares/vertex)
  {3,4}=octahedron (4 triangles/vertex)
  {5,3}=dodecahedron (3 pentagons/vertex)
  {3,5}=icosahedron (5 triangles/vertex)

For 4D polytopes: {p,q,r}.
  {3,3,3}=5-cell, {4,3,3}=tesseract, {3,3,4}=16-cell, {3,4,3}=24-cell.

The regularity condition: for {p,q}, the angle condition must satisfy:
  cos(π/p)/sin(π/q) < 1
This limits 3D solutions to exactly the 5 Platonic solids.

For the flat tiling case (Euclidean geometry), {3,6}, {4,4}, {6,3} are the three regular tilings.
For hyperbolic geometry, infinitely many regular tilings exist.

The Archimedean solids do not have simple Schläfli symbols but have vertex configurations like 3.4.4 (meaning one triangle + two squares meet at each vertex).

Vertex configuration of each Archimedean solid:
  Cuboctahedron: 3.4.3.4 (alternating triangle-square-triangle-square)
  Icosidodecahedron: 3.5.3.5
  Truncated Icosahedron: 5.6.6
  Snub Cube: 3.3.3.3.4 (4 triangles + 1 square)`,key_points:[`Schläfli symbol {p}: regular p-gon. {p,q}: q regular p-gons at each vertex.`,`5 Platonic solids: {3,3},{4,3},{3,4},{5,3},{3,5}. No others satisfy the angle condition.`,`Regular tilings: {3,6},{4,4},{6,3} for Euclidean. Infinite possibilities in hyperbolic.`,`Archimedean vertex configurations: e.g., 3.4.3.4 for cuboctahedron.`,`4D: {3,3,3}=5-cell, {4,3,3}=tesseract, etc.`,`The angle condition for {p,q}: cos(π/p)/sin(π/q)<1 limits Platonic solids to exactly 5.`],formulas:[{label:`Schläfli symbols (Platonic)`,expression:`{3,3},{4,3},{3,4},{5,3},{3,5}`,description:`The five Platonic solids in Schläfli notation.`},{label:`Angle condition`,expression:`cos(π/p)/sin(π/q) < 1 (spherical), =1 (flat), >1 (hyperbolic)`,description:`Determines the geometry of {p,q}.`},{label:`Regular flat tilings`,expression:`{3,6} triangles, {4,4} squares, {6,3} hexagons`,description:`The three regular tilings of the Euclidean plane.`}],worked_examples:[{title:`Verify {3,5} gives the icosahedron`,steps:[`{3,5}: triangular faces (p=3), 5 triangles at each vertex (q=5).`,`Angle condition: cos(π/3)/sin(π/5)=(1/2)/sin(36°)=(0.5)/(0.5878)≈0.851<1. ✓ Spherical.`,`V: each triangle has 3 vertices, each shared by 5 triangles. V×5=F×3 → V=3F/5.`,`With F=20: V=12, E=30. Euler: 12-30+20=2. ✓`,`This is the icosahedron: V=12, E=30, F=20, 5 triangles at each vertex.`]}]}],l={key_takeaways:[`5 Platonic solids: tetra(fire), cube(earth), octa(air), dodeca(ether), icosa(water). All V-E+F=2.`,`13 Archimedean solids: semi-regular, vertex-uniform. Largest V=120 (Trunc. Icosidodecahedron).`,`2D shapes: circle(πr²), triangle(√3/4·s²), square(s²,diag=s√2), pentagon(diag=φs), hexagon(6 triangles).`,`Sacred: Vesica Piscis width=r√3. Torus SA=4π²Rr, V=2π²Rr². Hexagonal packing≈90.69%.`,`Schläfli: {3,3}{4,3}{3,4}{5,3}{3,5}=the 5 Platonic. {3,6}{4,4}{6,3}=flat tilings.`,`Old geometry: finite, symmetric, static. New (Harmonic Solid): infinite, asymmetric, dynamic.`,`Both obey Euler's formula — the universal topological law connecting all polyhedra.`],core_formulas:[{label:`Euler (universal)`,expression:`V − E + F = 2`},{label:`Circle`,expression:`A=πr², C=2πr`},{label:`Pentagon diagonal`,expression:`d = φ×s`},{label:`Hexagon area`,expression:`(3√3/2)s²`},{label:`Vesica Piscis`,expression:`width=r√3, ratio=2/√3`},{label:`Torus`,expression:`SA=4π²Rr, V=2π²Rr²`},{label:`Regular n-gon area`,expression:`A=(ns²)/(4tan(π/n))`}]},u=[{question:`Which Platonic solid is associated with Water in Plato's cosmology? How many faces does it have?`,answer:`Icosahedron. F=20 triangular faces.`,difficulty:`easy`},{question:`What is the surface area of a cube with edge length 7?`,answer:`SA=6×7²=6×49=294.`,difficulty:`easy`},{question:`The Truncated Icosahedron (soccer ball) has V=60, E=90, F=32. Verify Euler's formula.`,answer:`60-90+32=2. ✓`,difficulty:`easy`},{question:`A regular hexagon with side s=4: find the area.`,answer:`A=(3√3/2)×16=24√3≈41.569.`,difficulty:`medium`},{question:`Vesica Piscis with r=6: find the width of the lens.`,answer:`Width=6×√3=6√3≈10.392.`,difficulty:`medium`},{question:`Torus with R=4, r=1: find surface area and volume.`,answer:`SA=4π²×4×1=16π²≈157.91. V=2π²×4×1=8π²≈78.96.`,difficulty:`hard`},{question:`The Schläfli symbol {5,3} represents which Platonic solid?`,answer:`Dodecahedron: 3 regular pentagons at each vertex. V=20, E=30, F=12.`,difficulty:`medium`}],d={id:e,title:t,subtitle:n,source_document:r,lecture_number:1,total_lectures:1,estimated_reading_minutes:32,overview:s,sections:c,summary:l,review_questions:u};export{d as default,o as estimated_reading_minutes,e as id,i as lecture_number,s as overview,u as review_questions,c as sections,r as source_document,n as subtitle,l as summary,t as title,a as total_lectures};