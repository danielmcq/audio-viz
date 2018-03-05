const MAX_SELECTABLE_STARS = 100
const ANALYSER_MAX_DECIBELS = -3
const ANALYSER_MIN_DECIBELS = -100

// const AUDIO_STREAM_URI = '/assets/audio/TheWarOnDrugs.m4a'
// const AUDIO_STREAM_URI = '/assets/audio/04Beethoven_PianoSonata14InCSharpMinorOp.27_2_moonlight_-1.AdagioSostenuto.mp3'
const AUDIO_STREAM_URI = '/assets/audio/Garbage - [2001] Beautiful Garbage - 01. Shut Your Mouth.mp3'
const AUDIO_FFT_SIZE = 2048

const CAMERA_FOV = 55
const CAMERA_FRUSTUM_PLANE_NEAR = 0.01
const CAMERA_FRUSTUM_PLANE_FAR = 1000
const CAMERA_INITIAL_POSITION = new THREE.Vector3(0.1, -0.14, 0.8)

const HEMISPHERE_LIGHT_INITIAL_POSITION = new THREE.Vector3(0, 10, 0)
const DIRECTIONAL_LIGHT_INITIAL_POSITION = new THREE.Vector3(5, 8.22, -3.68)

const PLANET_BIG_POSITION = new THREE.Vector3(-150, 40, -180)
const PLANET_MEDIUM_POSITION = new THREE.Vector3(40, 30, -100)
const PLANET_SMALL_POSITION = new THREE.Vector3(20, 70, -160)

const KEY_CODES = {
  c:     67,
  space: 32,
}

// const COLOR_SKY = '#3798D3'
const COLOR_SKY = '#01131E'
const COLOR_STAR = '#14EBFF'
const COLOR_PARTICLE = 'hsl(340, 48%, 54%)'

const COLORS = [
  ['#E9FF00', '#1A1600'],
  ['#C32C40', '#16001A'],
  ['#06FFC4', '#001A19'],
  ['#F69C3F', COLOR_SKY],
  ['#FFFFFF', '#080808']
]


// init
function init (window) {
  const loader = new THREE.JSONLoader()

  const members = {
    window,
    raycaster:       new THREE.Raycaster(),
    mouse:           new THREE.Vector2(),
    scene:           initScene(),// scene
    camera:          initCamera(window),// camera
    renderer:        initRenderer(window),// renderer
    audio:           initAudio(),// AUDIO
    selectableStars: [],
    intersected:     null,
    landscape:       null,
  }

  //load external geometry
  loader.load(
    '/assets/landscape.json',
    geometry=>members.landscape=createLandscape(members.scene, geometry)
  )

  // controls
  members.controls = initControls(members.camera)

  // LIGHTS
  members.lights = initLights(members.scene)

  // PLANETS
  members.planets = initPlanets(members.scene)

  // PARTICLES
  members.particles = createParticles(members.scene, 50)

  // EVENTS
  initEventListeners(members)

  return members
}

function initCamera (window) {
  const aspectRatio = window.innerWidth / window.innerHeight
  const camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspectRatio, CAMERA_FRUSTUM_PLANE_NEAR, CAMERA_FRUSTUM_PLANE_FAR)
  camera.position.set(CAMERA_INITIAL_POSITION.x, CAMERA_INITIAL_POSITION.y, CAMERA_INITIAL_POSITION.z)

  return camera
}

function initScene () {
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x01131e, 0.025)

  return scene
}

function initLights (scene) {
  const lights = {}

  // add pointlight
  lights.point = getPointLight(0.66)
  scene.add(lights.point)

  // add spotlight
  lights.spot = getSpotLight(2.66)
  scene.add(lights.spot)

  // add hemisphere light
  lights.hemi = new THREE.HemisphereLight('#00C2FF', '#FF9500', 0.4)
  lights.hemi.position.set(HEMISPHERE_LIGHT_INITIAL_POSITION.x, HEMISPHERE_LIGHT_INITIAL_POSITION.y, HEMISPHERE_LIGHT_INITIAL_POSITION.z)
  scene.add(lights.hemi)

  // add directional light
  lights.dir = new THREE.DirectionalLight('#FF5B2C', 1)
  lights.dir.position.set(DIRECTIONAL_LIGHT_INITIAL_POSITION.x, DIRECTIONAL_LIGHT_INITIAL_POSITION.y, DIRECTIONAL_LIGHT_INITIAL_POSITION.z)
  scene.add(lights.dir)

  lights.dir.castShadow = true
  lights.dir.shadow.mapSize.width = 2048
  lights.dir.shadow.mapSize.height = 2048
  lights.dir.shadow.camera.near = 0.5
  lights.dir.shadow.camera.far = 500
  lights.dir.shadow.camera.left = -10
  lights.dir.shadow.camera.right = 10

  return lights
}

function initControls (camera) {
  const controls = new THREE.OrbitControls(camera)
  const verticalAngle = controls.getPolarAngle()
  const horizontalAngle = controls.getAzimuthalAngle()

  controls.minPolarAngle = verticalAngle - 0.2
  controls.maxPolarAngle = verticalAngle + 0.2
  controls.minAzimuthAngle = horizontalAngle - 0.5
  controls.maxAzimuthAngle = horizontalAngle + 0.5

  return controls
}

function initRenderer (window) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.setClearColor(COLOR_SKY)
  window.document.body.appendChild(renderer.domElement)

  return renderer
}

function initPlanets (scene) {
  const planets = {}

  // add big planet
  planets.big = initBigPlanet(scene)

  // add medium planet
  planets.medium = initMediumPlanet(scene)

  // add small planet
  planets.small = initSmallPlanet(scene)

  return planets
}

function initBigPlanet (scene) {
  const planetBig = createPlanet(25)

  planetBig.position.z = PLANET_BIG_POSITION.z
  planetBig.position.x = PLANET_BIG_POSITION.x
  planetBig.position.y = PLANET_BIG_POSITION.y

  planetBig.rotateAt = 0.2
  planetBig.scale.set(1.5, 1.5, 1.5)

  planetBig.rotation.z = Math.PI / 2
  planetBig.rotation.y = 0.3
  planetBig.rotation.x = 1.5

  scene.add(planetBig)

  // add ellipses
  const ellipses = createEllipses(30)
  planetBig.add(ellipses)

  return planetBig
}

function initMediumPlanet (scene) {
  const planetMedium = createPlanet()

  planetMedium.position.z = PLANET_MEDIUM_POSITION.z
  planetMedium.position.x = PLANET_MEDIUM_POSITION.x
  planetMedium.position.y = PLANET_MEDIUM_POSITION.y

  planetMedium.scale.set(5.5, 5.5, 5.5)

  scene.add(planetMedium)

  return planetMedium
}

function initSmallPlanet (scene) {
  const planetSmall = createPlanet()

  planetSmall.position.z = PLANET_SMALL_POSITION.z
  planetSmall.position.x = PLANET_SMALL_POSITION.x
  planetSmall.position.y = PLANET_SMALL_POSITION.y

  planetSmall.scale.set(5, 5, 5)

  scene.add(planetSmall)

  return planetSmall
}

function initAudio () {
  const listener = new THREE.AudioListener()
  const audio = new THREE.Audio(listener)
  audio.crossOrigin = 'anonymous'
  audio.src = AUDIO_STREAM_URI
  loadAudioSource(AUDIO_STREAM_URI)
    .then(buffer=>{
      audio.setBuffer(buffer)
      audio.setLoop(true)
      audio.play()
    })

  const analyser = new THREE.AudioAnalyser(audio, AUDIO_FFT_SIZE)

  analyser.analyser.maxDecibels = ANALYSER_MAX_DECIBELS
  analyser.analyser.minDecibels = ANALYSER_MIN_DECIBELS

  const refs = {
    getAnalyser:     ()=>analyser,
    getCurrentSound: ()=>audio,
    playPause:       ()=>{
      if (audio.isPlaying) audio.pause()
      else audio.play()
    },
  }
  window.player = refs

  return refs
}

async function loadAudioSource (source, onProgress) {
  if (!onProgress) onProgress=()=>{}

  const audioLoader = new THREE.AudioLoader()

  return new Promise((resolve, reject)=>{
    audioLoader.load(source, resolve, onProgress, reject)
  })
}

function initEventListeners (members) {
  const {window, camera, renderer} = members

  window.addEventListener('keydown', onKeyDown(members), false)
  window.addEventListener('resize', onWindowResize(window, camera, renderer), false)
  window.addEventListener('mousemove', onMouseMove(members), false)
  window.addEventListener('mousedown', onMouseDown(members), false)
}

// create pointlight
function getPointLight (intensity) {
  const light = new THREE.PointLight('#06FFC4', intensity)
  light.position.x = -33
  light.position.y = 22
  light.position.z = -40

  return light
}

// create spotlight
function getSpotLight (intensity) {
  const light = new THREE.SpotLight('#F69C3F', intensity)
  light.position.x = 104
  light.position.y = 50
  light.position.z = -500

  return light
}

// create landscape
function createLandscape (scene, geometry) {
  geometry.computeVertexNormals()
  const material = new THREE.MeshPhongMaterial({
    color:      '#383948',
    emissive:   '#0D0D0D',
    specular:   '#21141C',
    shininess:  6.84,
    side:       THREE.DoubleSide,
    shadowSide: THREE.FrontSide,
    wireframe:  false,
  })

  const landscape = new THREE.Mesh(geometry, material)

  landscape.position.y = -0.5
  landscape.position.z = -4.79

  landscape.castShadow = true
  landscape.receiveShadow = true

  scene.add(landscape)

  return landscape
}

// create planet
function createPlanet (size) {
  const geometry = new THREE.SphereGeometry(size, 32, 32)
  const material = new THREE.MeshPhongMaterial({
    color:     '#3F3D3D',
    emissive:  '#05001B',
    specular:  '#111111',
    shininess: 10,
    wireframe: false,
    fog:       false,
  })
  const planet = new THREE.Mesh(geometry, material)

  return planet
}

// create ellipses
function createEllipses (amount) {
  const ellipses = new THREE.Group()

  for (let i = 0; i < amount; i++) {
    const curve = new THREE.EllipseCurve(0, 0, 26, 35, 0, 2 * Math.PI, false, 0)
    const points = curve.getPoints(80)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({ fog: false })
    const ellipse = new THREE.Line(geometry, material)

    const color = new THREE.Color().setHSL(21 / 360, 0.17, randBetween(0.1, 0.6))
    ellipse.material.color = color

    ellipse.scale.x = 1 + i / 100
    ellipse.scale.y = 0.9 + i / 30
    ellipse.scale.z = 1 + i / 100

    ellipses.add(ellipse)
  }

  return ellipses
}

// create stars
function createStar () {
  const star = new THREE.Group()
  const geometry = new THREE.TetrahedronBufferGeometry(1, 0)
  const material = new THREE.MeshPhongMaterial({ color: COLOR_STAR, wireframe: false, fog: false, transparent: false })

  const starSideOne = new THREE.Mesh(geometry, material)
  const starSideTwo = new THREE.Mesh(geometry, material)
  starSideOne.castShadow = true
  starSideTwo.castShadow = true

  starSideOne.receiveShadow = true
  starSideTwo.receiveShadow = true

  starSideTwo.rotation.x = Math.PI / 2

  star.add(starSideOne)
  star.add(starSideTwo)

  star.rotation.x = 90 * Math.PI / 180
  star.rotation.y = randBetween(0, 45) * Math.PI / 180

  star.position.set(randBetween(-4, 4), -0.43, randBetween(-5, -1))

  const tl = new TimelineMax()
  tl.fromTo(
    star.scale,
    1,
    { y: 0.01, z: 0.01, x: 0.01 },
    { y: 0.1, z: 0.1, x: 0.1, ease: Elastic.easeIn.config(1, 0.4) }
  )

  star.name = 'star'

  return star
}

// create particles
function createParticles (scene, amount) {
  const particles = []

  for (let i = 0; i < amount; i++) {
    const geometry = new THREE.SphereBufferGeometry(1, 12, 12)
    const material = new THREE.MeshPhongMaterial({ color: COLOR_PARTICLE, wireframe: true })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.scale.set(0.1, 0.1, 0.1)

    sphere.position.x = randBetween(-6, 6)
    sphere.position.z = randBetween(-10, -4)

    sphere.castShadow = true
    sphere.receiveShadow = true

    particles.push(sphere)

    scene.add(sphere)
  }

  return particles
}

// HELPER
function randBetween (min, max) {
  return Math.random() * (max - min) + min
}

// EVENTS
//  on mouse down
function onMouseDown (members) {
  return event=>{
    event.preventDefault()

    if (members.intersected) {
    // remove from array
      const index = members.selectableStars.indexOf(members.intersected)
      members.selectableStars.splice(index, 1)

      // animate stars
      const tl = new TimelineMax()
      tl.to(members.intersected.position, 5, {
        x:    randBetween(-300, 300),
        y:    randBetween(2, 200),
        z:    randBetween(-200, -400),
        ease: Back.easeOut.config(0.3),
      })
      tl.to(members.intersected.scale, 5, {
        y:    0.8,
        z:    0.8,
        x:    0.8,
        ease: Elastic.easeIn.config(1, 0.3),
      })

      if (index % 2 === 0) {
        tl.fromTo(
          members.intersected.scale,
          5,
          {
            y: 0.3,
            z: 0.3,
            x: 0.3,
          },
          {
            y:           1,
            z:           1,
            x:           1,
            ease:        Elastic.easeIn.config(1, 0.3),
            repeatDelay: randBetween(3, 6),
            repeat:      -1,
            yoyo:        true,
          }
        )
      }
    }
  }
}

// on key down
function onKeyDown (members) {
  const {renderer, lights, audio} = members

  let currentIndex = 0

  return event=>{
    if (event.keyCode === KEY_CODES.c) {
      const newIndex = currentIndex !== 4 ? currentIndex + 1 : 0
      currentIndex = newIndex
      const color = COLORS[newIndex]

      renderer.setClearColor(color[1])
      lights.spot.color.set(color[0])
    } else if (event.keyCode === KEY_CODES.space) {
      audio.playPause()
    }
  }
}

//  on mouse move
function onMouseMove (members) {
  const {camera, raycaster, mouse, selectableStars} = members

  return event=>{
    event.preventDefault()
    mouse.x = event.clientX / window.innerWidth * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // update the ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera)

    // calculate objects intersecting the ray
    const intersects = raycaster.intersectObjects(selectableStars, true)

    // change color on hover
    if (intersects.length > 0) {
      for (let i = 0; i < selectableStars.length; i++) {
        if (intersects[0].object.parent === selectableStars[i]) {
          if (members.intersected) members.intersected.children.forEach(child => child.material.color.set(COLOR_STAR))
          members.intersected = intersects[0].object.parent

          members.intersected.children.forEach(child => child.material.color.set('#fff'))
        }
      }
    } else {
      if (members.intersected) members.intersected.children.forEach(child => child.material.color.set(COLOR_STAR))
      members.intersected = null
    }
  }
}

// on resize
function onWindowResize (window, camera, renderer) {
  return ()=>{
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

// AUDIO
function getAudioData (audio) {
  const analyser = audio.getAnalyser()
  const FREQ_SET_LENGTH = 3
  // Split array into 3
  const frequencySets = splitFrenquencyArray(analyser.data, FREQ_SET_LENGTH)

  // Make average of frenquency array entries
  const audioData = frequencySets.map(frenquencySet=>{
    const average = frenquencySet.reduce((avg,freq)=>{
      avg += freq
      return avg
    },0)
    return average / frenquencySet.length
  })

  return audioData
}

function splitFrenquencyArray (arr, n) {
  let i = 0
  const result = []
  let size

  while (i < arr.length) {
    size = Math.ceil((arr.length - i) / n--)
    result.push(arr.slice(i, i + size))
    i += size
  }

  return result
}

function updateCurrentSongDisplay (members) {
  const sound = members.audio.getCurrentSound()
  const filename = sound.src.split('/').pop()
  const duration = sound.buffer&&sound.buffer.duration||0
  const currentTime = sound.context&&sound.context.currentTime||0
  const text = `"${filename}" ${secondsToString(currentTime)} / ${secondsToString(duration)}`
  setCurrentSongDisplay(text)
}

function secondsToString (ss) {
  if (ss) {
    const minutes = Number.parseInt(ss/60)
    const seconds = Number.parseInt(ss%60)
    const secondsArray = seconds.toString().split('')
    secondsArray.unshift(0)
    const secondsString = secondsArray.slice(-2).join('')

    return `${minutes}:${secondsString}`
  }
  return ''
}

function setCurrentSongDisplay (text) {
  const el = window.document.getElementById('currentSong')
  el.innerText = text
}

// animate
function animate (members) {
  const {scene, planets, audio, particles, selectableStars} = members
  // get audio data
  const audioData = getAudioData(audio).filter(v=>v)
  const audioDataLength = audioData.length

  // animate particles
  particles.forEach((particle,i) => (particle.position.y = audioData[i%audioDataLength] / 100 - 0.48))

  // animate planets
  if (audioData[0] >= 1) {
    planets.big.rotation.z += 0.005
  }
  if (audioData[1%audioDataLength] >= 1) {
    planets.small.scale.y = planets.small.scale.x = planets.small.scale.z = 5 + audioData[1%audioDataLength] / 20
  }
  if (audioData[2%audioDataLength] >= 1) {
    planets.medium.scale.y = planets.medium.scale.x = planets.medium.scale.z = 5 + audioData[2%audioDataLength] / 20
  }

  // create stars
  if (audioData[0] >= 100 && selectableStars.length < MAX_SELECTABLE_STARS) {
    const star = createStar()
    scene.add(star)
    selectableStars.push(star)
  }

  updateCurrentSongDisplay(members)

  requestAnimationFrame(()=>animate(members))
  render(members)
}

// render
function render (members) {
  const {scene, camera, audio, renderer} = members

  audio.getAnalyser().getFrequencyData()
  renderer.render(scene, camera)
}

document.onreadystatechange = ()=>{
  if (document.readyState === 'complete') {
    const initData = init(window)
    animate(initData)
  }
}