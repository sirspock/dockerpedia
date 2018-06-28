"""empty message

Revision ID: 54bc69c4f532
Revises: 1086a5a24252
Create Date: 2018-02-24 14:53:11.741269

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '54bc69c4f532'
down_revision = '1086a5a24252'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tag_layer', sa.Column('tag_id', sa.Integer(), nullable=False))
    op.create_index(op.f('ix_tag_layer_tag_id'), 'tag_layer', ['tag_id'], unique=False)
    op.create_index('tag_layer_tag_id_layer_id_idx', 'tag_layer', ['tag_id', 'layer_id'], unique=False)
    op.create_unique_constraint(None, 'tag_layer', ['layer_id', 'tag_id'])
    op.create_foreign_key(None, 'tag_layer', 'tag', ['tag_id'], ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'tag_layer', type_='foreignkey')
    op.drop_constraint(None, 'tag_layer', type_='unique')
    op.drop_index('tag_layer_tag_id_layer_id_idx', table_name='tag_layer')
    op.drop_index(op.f('ix_tag_layer_tag_id'), table_name='tag_layer')
    op.drop_column('tag_layer', 'tag_id')
    # ### end Alembic commands ###
