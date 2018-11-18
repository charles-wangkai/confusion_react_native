import React, { Component } from 'react';
import {
    Text,
    View,
    ScrollView,
    FlatList,
    Modal,
    Button,
    Alert,
    PanResponder
} from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators.js';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    };
};

const mapDispatchToProps = dispatch => ({
    postFavorite: dishId => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) =>
        dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => (this.view = ref);

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200) {
            return true;
        } else {
            return false;
        }
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view
                .rubberBand(1000)
                .then(endState =>
                    console.log(endState.finished ? 'finished' : 'cancelled')
                );
        },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' +
                        dish.name +
                        ' to your favorites?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel pressed'),
                            style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () =>
                                props.favorite
                                    ? console.log('Already favorite')
                                    : props.onPress()
                        }
                    ],
                    { cancelable: false }
                );
            }

            return true;
        }
    });

    if (dish != null) {
        return (
            <Animatable.View
                animation="fadeInDown"
                duration={2000}
                delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}
            >
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}
                >
                    <Text style={{ margin: 10 }}>{dish.description}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}
                    >
                        <Icon
                            raised
                            reverse
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type="font-awesome"
                            color="#f50"
                            onPress={() =>
                                props.favorite
                                    ? console.log('Already favorite')
                                    : props.onPress()
                            }
                        />
                        <Icon
                            raised
                            reverse
                            name="pencil"
                            type="font-awesome"
                            color="#512DA8"
                            onPress={props.toggleModal}
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    } else {
        return <View />;
    }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {
        return (
            <View key={index} style={{ margin: 10 }}>
                <Text style={{ fontSize: 14 }}>{item.comment}</Text>
                <Rating
                    imageSize={20}
                    readonly
                    startingValue={item.rating}
                    style={{ paddingVertical: 10, flexDirection: 'row' }}
                />
                <Text style={{ fontSize: 12 }}>
                    {'-- ' + item.author + ', ' + item.date}
                </Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {
    constructor(props) {
        super(props);

        this.state = {
            rating: 3,
            author: '',
            comment: '',
            showModal: false
        };
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    toggleModal() {
        this.setState({ showModal: !this.state.showModal });
    }

    handleComment(dishId) {
        this.props.postComment(
            dishId,
            this.state.rating,
            this.state.author,
            this.state.comment
        );
    }

    resetForm() {
        this.setState({
            rating: 3,
            author: '',
            comment: '',
            showModal: false
        });
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '');

        return (
            <ScrollView>
                <RenderDish
                    dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    toggleModal={() => this.toggleModal()}
                />
                <RenderComments
                    comments={this.props.comments.comments.filter(
                        comment => comment.dishId === dishId
                    )}
                />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => {
                        this.toggleModal();
                        this.resetForm();
                    }}
                    onRequestClose={() => {
                        this.toggleModal();
                        this.resetForm();
                    }}
                >
                    <View style={{ margin: 10 }}>
                        <Rating
                            showRating
                            startingValue={this.state.rating}
                            onFinishRating={rating =>
                                this.setState({ rating: rating })
                            }
                        />
                    </View>
                    <View style={{ margin: 10 }}>
                        <Input
                            value={this.state.author}
                            onChangeText={text =>
                                this.setState({ author: text })
                            }
                            placeholder="Author"
                            leftIcon={{
                                type: 'font-awesome',
                                name: 'user-o'
                            }}
                        />
                    </View>
                    <View style={{ margin: 10 }}>
                        <Input
                            value={this.state.comment}
                            onChangeText={text =>
                                this.setState({ comment: text })
                            }
                            placeholder="Comment"
                            leftIcon={{
                                type: 'font-awesome',
                                name: 'comment-o'
                            }}
                        />
                    </View>
                    <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => {
                                this.handleComment(dishId);

                                this.toggleModal();
                                this.resetForm();
                            }}
                            color="#512DA8"
                            title="SUBMIT"
                        />
                    </View>
                    <View style={{ margin: 10 }}>
                        <Button
                            onPress={() => {
                                this.toggleModal();
                                this.resetForm();
                            }}
                            color="gray"
                            title="CANCEL"
                        />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dishdetail);
