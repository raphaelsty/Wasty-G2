import React, { Component } from 'react'
import { Alert, Linking, ListView, RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { format } from 'date-fns'
import { reject } from 'lodash'
import { Actions } from 'react-native-router-flux'

import ItemRow from './components/ItemRow'
import Button from '../../components/Button'
import Container from '../../components/Container'
import LoadMoreButton from '../../components/LoadMoreButton'
import Separator from '../../components/Separator'
import { getLikes, getUser } from '../../data/api'
import { colors } from '../../style'
import { generateGoogleMapsItinerary } from '../../util'

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

export default class LikesScene extends Component {

  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      items: [],
      user: {},
      location: {
        lat: 48.566140,
        lon: -3.148260
      },
      // User location stuff
      initialPosition: null,
      lastPosition: null
    }
    this.watchID = null
  }

  refreshItems () {
    this.setState({refreshing: true})
    getLikes()
      .then(items => { this.setState({items}) })
      .catch(() => {})
    this.setState({refreshing: false})
  }

  loadMoreItems () {
    const items = this.state.items
    items.push(items[Math.floor(Math.random() * items.length)])
    this.setState({items})
  }

  onDeleteItem (id) {
    const listWithoutItem = reject(this.state.items, {id: id})
    console.log(id, listWithoutItem)
    this.setState({items: listWithoutItem})
  }

  onPickedUpItem (id) {
    const listWithoutItem = reject(this.state.items, {id: id})
    console.log(id, listWithoutItem)
    this.setState({items: listWithoutItem})
  }

  componentDidMount () {
    getLikes()
      .then(items => { this.setState({items}) })
      .catch(() => {})

    getUser()
      .then(user => { this.setState({user}) })
      .catch(() => { this.setState({user: {}}) })

    // Get user position
    navigator.geolocation.getCurrentPosition(
      position => {
        const initialPosition = JSON.stringify(position)
        this.setState({initialPosition})
      },
      error => Alert.alert('Erreur de localisation', JSON.stringify(error)),
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

  generateItinerary () {
    const payload = {
      start: {
        latitude: this.lastPosition ? this.lastPosition.coords.latitude : 43.589012,
        longitude: this.lastPosition ? this.lastPosition.coords.longitude : 1.450592,
        departure_time: format(Date.now(), 'HH:MM:SS'),
        car_size: this.state.user.carSize
      },
      items: this.state.items.map(item => ({
        available_since: item.availabilitySince,
        available_until: item.availabilityUntil,
        latitude: item.address.lat,
        longitude: item.address.lon,
        volume: item.volume,
        weight: item.weight
      }))
    }

    const url = generateGoogleMapsItinerary(payload.items)
    Linking.openURL(url)
  }

  render () {
    return (
      <Container style={{backgroundColor: colors.background}}>

        {/* A ScrollView is necessary to put a "Load more" button under the list of posted items */}
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshItems.bind(this)}
            />
          }
          showsVerticalScrollIndicator={false}
        >

          <ListView
            style={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.refreshItems.bind(this)}
              />
            }
            dataSource={ds.cloneWithRows(this.state.items)}
            renderRow={item => (
              <ItemRow
                item={item}
                onDeleteItem={this.onDeleteItem.bind(this)}
                onPickedUpItem={this.onPickedUpItem.bind(this)}
                onPressAction={() => Actions.likesItemScene({item: item,
                  userLat: this.state.location.lat,
                  userLon: this.state.location.lon})}
                userLat={this.state.location.lat}
                userLon={this.state.location.lon}
              />
            )}
            renderSeparator={(sectionId, rowId) => <Separator key={rowId} />}
            enableEmptySections
            showsVerticalScrollIndicator={false}
          />

          {/* Load more button */}
          <View style={{marginTop: 6}}>
            <LoadMoreButton
              iconColor='white'
              onPress={this.loadMoreItems.bind(this)}
            />
          </View>

        </ScrollView>

        <View style={{marginTop: 5}}>
          <Button
            onPress={this.generateItinerary.bind(this)}
            text='Récupérer mes items'
          />
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    marginTop: 7
  }
})
