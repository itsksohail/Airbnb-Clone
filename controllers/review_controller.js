const reviewModel = module.require('../schemaModel/reviewModel.js');
const listingModel = module.require('../schemaModel/listingSchema.js');

module.exports.reviewPost = async (req, res, next) => {
    let { lis_id } = req.params;
    let { s_radio_name, feedback_comment_name } = req.body;

    let review_list = new reviewModel({
        star_point: s_radio_name,
        feedback_comment: feedback_comment_name,
        feedback_author: req.user._id
    });

    await review_list.save()
        .then((resp) => {
            console.log('feedback document saved: ', resp);
        });
        
    let lis_obj = await listingModel.findById(lis_id);
    lis_obj.feedbacks.push(review_list);
        await lis_obj.save()
            .then((resp) => {
                res.send(`<script>alert('Feedback submitted successfully'),
                    window.location.href = '/listings/${lis_id}'
                    </script>`);
                console.log('feedback updated on listing model', resp);
            })
            .catch((err) => {
                res.send(`<script>alert('Feedback submit failed'),
                    window.location.href = '/listings/${lis_id}'
                    </script>`);
            });
}

module.exports.reviewDelete = async(req, res, next)=>{

    let { lis_id ,rev_id } = req.params;

    await reviewModel.findByIdAndDelete(rev_id);

    let resp = await listingModel.updateOne({_id: lis_id}, {$pull: {feedbacks: rev_id}});

    if(resp){
        console.log('feedback instance deleted from listing model', resp);
        res.json({ success: true, id: rev_id });
    }else{
        res.json({ success: false });
    }
}