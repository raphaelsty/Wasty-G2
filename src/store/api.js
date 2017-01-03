import { Item, User } from '../classes'

export const getItems = () => {
  return new Promise((resolve, reject) => {
    const response = require('./mocks/items.json')
    const items = response.map(item => new Item({
      category: item.category,
      cityName: item.city_name,
      imgUrl: item.img,
      imgPlaceholderUrl: item.img_placeholder,
      lat: item.coordinates.lat,
      lon: item.coordinates.lon,
      nViews: item.views,
      publishDate: item.publish_date,
      streetName: item.street_name,
      title: item.title,
      publisher: new User({
        email: item.publisher.email,
        firstName: item.publisher.first_name,
        imgUrl: item.publisher.img_url,
        joinDate: item.publisher.date_joined,
        lastName: item.publisher.last_name
      })
    }))

    resolve(items)
  })
}

export const getUser = () => {
  return new Promise((resolve, reject) => {
    const response = require('./mocks/user.json')
    const user = new User({
      email: response.email,
      firstName: response.first_name,
      imgUrl: response.img,
      imgPlaceholderUrl: response.img_placeholder,
      joinDate: response.date_joined,
      lastName: response.last_name
    })
    resolve(user)
  })
}
