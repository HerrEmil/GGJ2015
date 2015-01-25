var story = {
    'clicking tent': {
        id:      'tent',
        success: '- Oh no! There is a snake in front of the tent!'
    },
    'getting a club': {
        id:      'dead_x5F_tree_3_',
        premise: 'clicking tent',
        locked:  'It´s a tree.',
        success: ' - Hmm… A branch from that dead tree could be used as a deadly club.',
    },
    'sleeping in tent': {
        id:      'tent',
        premise: 'getting a club',
        locked:  '- Oh no! There is a snake in front of the tent!',
        success: ' - Hah! The snake is no more!  - It is time to go to sleep.'
    },
    'getting matches': {
        id: 'bag',
        premise: 'sleeping in tent',
        success: ' - There is a box of matches in this bag! - I bet the wolf is afraid of fire. - What do we light on fire?'
    },
    'making a torch': {
        id: 'dead_x5F_tree_4_',
        premise: 'getting matches',
        locked:  ' - I don’t think hitting the wolf like we did the snake is a good idea…',
        success: ' - Nice! We use the matches to light a branch on fire! - I bet we can scare away the wolf with this torch!'
    },
    'scaring the wolf': {
        id: 'wolf_2_',
        premise: 'making a torch',
        locked:  ' - We need something to scare away the wolf!',
        success: ' - Excellent! The wolf is afraid of the fire! - Now we can finally get some rest!'
    }
};
