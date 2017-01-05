import React, { Component } from 'react'
import { Alert, NetInfo, StyleSheet } from 'react-native'

import { Actions, Router, Scene } from 'react-native-router-flux'

import Overlay from './components/Overlay'
import RouterTitle from './components/RouterTitle'
import TabIcon from './components/TabIcon'
import AccountScene from './scenes/AccountScene'
import AccountSettingsScene from './scenes/AccountSettingsScene'
import ItemScene from './scenes/ItemScene'
import ListScene from './scenes/ListScene'
import SearchScene from './scenes/SearchScene'
import MapScene from './scenes/MapScene'
import PostsScene from './scenes/PostsScene'

// Disable RCTAnimation warning
console.ignoredYellowBox = ['Animated: `useNativeDriver` is not']

const styles = StyleSheet.create({
  sceneStyle: {
    flex: 1
  },
  tabBar: {
    borderTopWidth: 0.5,
    borderColor: '#b7b7b7',
    backgroundColor: 'white',
    opacity: 1
  }
})

const scenes = Actions.create(
  <Scene key='root' tabs hideNavBar tabBarStyle={styles.tabBar}>
    <Scene title='Mes posts' key='postsScene' icon={TabIcon} iconName='playlist-add'>
      <Scene title='Mes posts' key='postsViewScene' component={PostsScene} />
      <Scene title='Mes posts' key='postsItemScene' component={ItemScene} />
    </Scene>
    <Scene title='Ma liste' key='listScene' icon={TabIcon} iconName='playlist-add-check'>
      <Scene title='Ma liste' key='listViewScene' component={ListScene} />
      <Scene title='Ma liste' key='listItemScene' component={ItemScene} />
    </Scene>
    <Scene title='Recherche' key='searchScene' icon={TabIcon} iconName='search' initial>
      <Scene title='Recherche' key='searchViewScene' component={SearchScene} />
      <Scene title='Recherche' key='searchItemScene' component={ItemScene} />
    </Scene>
    <Scene title='Carte' key='mapScene' component={MapScene} icon={TabIcon} iconName='map' />
    <Scene title='Compte' key='accountScene' icon={TabIcon} iconName='account-circle'>
      <Scene title='Compte' key='accountViewScene' component={AccountScene} />
      <Scene title='Modifier mes informations' key='accountSettingsScene' component={AccountSettingsScene} />
    </Scene>
  </Scene>
)

export default class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      // Internet connection stuff
      isConnected: true,
      serverResponding: true,

      // User location stuff
      initialPosition: null,
      lastPosition: null
    }
    this.watchID = null
  }

  componentWillMount () {
    // Check user internet connection
    const setIsConnected = isConnected => this.setState({isConnected})
    NetInfo.isConnected.addEventListener('change', setIsConnected)
  }

  componentDidMount () {
    // Get user position
    navigator.geolocation.getCurrentPosition(
      position => {
        const initialPosition = JSON.stringify(position)
        this.setState({initialPosition})
      },
      error => Alert.alert(
        'Erreur de localisation',
        JSON.stringify(error)
      ),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    )
    this.watchID = navigator.geolocation.watchPosition(position => {
      const lastPosition = JSON.stringify(position)
      this.setState({lastPosition})
    })
  }

  componentWillUnmount () {
    navigator.geolocation.clearWatch(this.watchID)
  }

  render () {
    if (!this.state.isConnected) {
      return (<Overlay iconLabel='bolt' message='Vous êtes hors-ligne' />)
    } else if (!this.state.serverResponding) {
      return (<Overlay iconLabel='server' message='Le serveur ne répond pas' />)
    } else {
      return (
        <Router
          scenes={scenes}
          sceneStyle={styles.sceneStyle}
          renderTitle={scene => <RouterTitle scene={scene} />}
        />
      )
    }
  }
}
