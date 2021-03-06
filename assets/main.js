function draw() {
  const pi = Math.PI
  const form = document.getElementById('form')
  const cutCount = form.cutCount.value == "1" ? 1 : 2
  const kerf = cutCount == 1 ? parseFloat(form.kerf.value) : 0
  const length = parseFloat(form.length.value)
  const depth = parseFloat(form.depth.value)
  const diameter = parseFloat(form.diameter.value) * 12.0
  const removeStones = parseInt(form.removeStones.value)
  const radius = diameter / 2.0

  const outerCircumference = pi * diameter
  const innerCircumference = pi * (diameter - depth * 2)

  const ratio = innerCircumference / outerCircumference

  const longLength = cutCount == 1 ? ((length - kerf) / (1 + ratio)) : (length * 0.5)
  const shortLength = cutCount == 1 ? ((length - kerf) - longLength) : (length * ratio * 0.5)
  const anglePerStone = calculateAnglePerStone(longLength, shortLength, depth)

  const stoneCount = Math.floor(360.0 / anglePerStone) - removeStones

  updateStoneCount(stoneCount)
  updateStoneInfo(longLength, shortLength, kerf)

  const padding = 3

  const viewBox = [
    0 - radius - padding,
    0 - radius - padding,
    2.0 * (radius + padding),
    2.0 * (radius + padding),
  ].join(' ')

  const stoneSvgs = new Array(stoneCount).fill(undefined).map((_, index) => {
    return buildStoneSvg(
      index,
      longLength,
      shortLength,
      depth,
      radius,
      cutCount == 1,
    )
  })
  const stonesSvg = [
    `<g transform="rotate(${calculateStoneRotation(stoneCount, anglePerStone)})">`,
    stoneSvgs,
    '</g>',
  ].join('')

  document.getElementById('drawing').innerHTML = [
    `<svg style="width: 100%; max-height: 100%" viewBox="${viewBox}" preserveAspectRatio="none">`,
    buildCircleSvg(radius),
    stonesSvg,
    '</svg>'
  ].join('')

  document.getElementById('cutLengthsStone').innerHTML = [
    `<svg style="background-color: #3D40FC; width: 100%; max-height: 100%" viewBox="0 0 ${length} ${depth}" preserveAspectRatio="none">`,
    buildTrapezoidSvg(
      [0, 0],
      [length, 0],
      [length, depth],
      [0, depth],
    ),
    buildLineSvg(
      [longLength, 0],
      [shortLength, depth],
      true,
    ),
    '</svg>'
  ].join('')

  document.getElementById('cutLengthsWithKerfStone').innerHTML = [
    `<svg style="background-color: #3D40FC; width: 100%; max-height: 100%" viewBox="0 0 ${length} ${depth}" preserveAspectRatio="none">`,
    buildTrapezoidSvg(
      [0, 0],
      [longLength - kerf * 0.5, 0],
      [shortLength - kerf * 0.5, depth],
      [0, depth],
    ),
    buildTrapezoidSvg(
      [longLength + kerf * 0.5, 0],
      [length, 0],
      [length, depth],
      [shortLength + kerf * 0.5, depth],
    ),
    '</svg>'
  ].join('')

  document.getElementById('sideLengthsStone').innerHTML = [
    `<svg style="background-color: #3D40FC; width: 100%; max-height: 100%" viewBox="0 0 ${longLength * 2.0} ${depth}" preserveAspectRatio="none">`,
    buildTrapezoidSvg(
      [0, 0],
      [longLength * 2.0, 0],
      [longLength + shortLength, depth],
      [longLength - shortLength, depth],
    ),
    buildLineSvg(
      [longLength, 0],
      [longLength, depth],
    ),
    '</svg>'
  ].join('')

  document.getElementById('fullSideLengthsStone').innerHTML = [
    `<svg style="background-color: #3D40FC; width: 100%; max-height: 100%" viewBox="0 0 ${longLength * 2.0} ${depth}" preserveAspectRatio="none">`,
    buildTrapezoidSvg(
      [0, 0],
      [longLength * 2.0, 0],
      [longLength + shortLength, depth],
      [longLength - shortLength, depth],
    ),
    '</svg>'
  ].join('')

  $('.cutCountContainer').hide()
  $(`.cutCountContainer.cutCount${cutCount}`).show()
}

function calculateStoneRotation(stoneCount, anglePerStone) {
  const unusedAngle = 360.0 - (stoneCount * anglePerStone)

  return unusedAngle * 0.5 + anglePerStone * 0.5 + 180.0
}

function calculateAnglePerStone(longLength, shortLength, depth) {
  const angleRadians = Math.atan((longLength - shortLength) / depth) * 2.0

  return angleRadians * 180.0 / Math.PI
}

function buildCircleSvg(radius) {
  const style = 'fill: #3D40FC;'

  return `<circle cx="0" cy="0" r="${radius}" style="${style}" />`
}

function buildStoneSvg(stoneIndex, longLength, shortLength, depth, radius, showCut) {
  const rotation = stoneIndex * calculateAnglePerStone(longLength, shortLength, depth)

  return [
    `<g transform="rotate(${rotation})">`,
    buildTrapezoidSvg(
      [-longLength, -radius],
      [longLength, -radius],
      [shortLength, -radius + depth],
      [-shortLength, -radius + depth],
    ),
    showCut ?
      buildLineSvg(
        [0, -radius],
        [0, -radius + depth],
      ) :
      '',
    '</g>'
  ].join('')
}

function buildLineSvg(point1, point2, dashed) {
  const dashedStyle = dashed ? 'stroke-dasharray:1' : ''

  return [
    `<line x1="${point1[0]}" y1="${point1[1]}" x2="${point2[0]}" y2="${point2[1]}" style="stroke:black; stroke-width:0.1; ${dashedStyle}" />`
  ].join('')
}

function buildTrapezoidSvg(topLeft, topRight, bottomRight, bottomLeft) {
  return [
    '<polygon points="',
    buildPoint(topLeft),
    buildPoint(topRight),
    buildPoint(bottomRight),
    buildPoint(bottomLeft),
    `" style="fill:red; stroke:black; stroke-width:0.1; fill-opacity: .75" />`
  ].join('')
}

function buildPoint(point) {
  return [
    point[0],
    point[1],
  ].join(',') + ' '
}

function updateStoneCount(stoneCount) {
  document.getElementById('stoneCount').innerHTML = stoneCount
}

function updateStoneInfo(longLength, shortLength, kerf) {
  const halfKerf = kerf * 0.5

  document.getElementById('longCut').innerHTML = (longLength + halfKerf).toFixed(3)
  document.getElementById('shortCut').innerHTML = (shortLength + halfKerf).toFixed(3)
  document.getElementById('longCutWithKerf').innerHTML = longLength.toFixed(3)
  document.getElementById('shortCutWithKerf').innerHTML = shortLength.toFixed(3)
  document.getElementById('longSide').innerHTML = (longLength * 2.0).toFixed(3)
  document.getElementById('shortSide').innerHTML = (shortLength * 2.0).toFixed(3)
  document.getElementById('fullLongSide').innerHTML = (longLength * 2.0).toFixed(3)
  document.getElementById('fullShortSide').innerHTML = (shortLength * 2.0).toFixed(3)
  document.getElementById('cutFromEdge').innerHTML = (longLength - shortLength).toFixed(3)
}

function syncFormToParameters() {
  const form = document.getElementById('form')
  const searchParams = new URLSearchParams(window.location.search)
  const params = ['cutCount', 'kerf', 'length', 'depth', 'diameter', 'removeStones']

  params.forEach((param) => {
    const value = searchParams.get(param)
    if (value) {
      $(form[param]).val(value)
    }
  })
}
