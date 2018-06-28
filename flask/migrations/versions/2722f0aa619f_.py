"""empty message

Revision ID: 2722f0aa619f
Revises: 1f0ecc72bfb9
Create Date: 2018-03-30 15:55:38.902437

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2722f0aa619f'
down_revision = '1f0ecc72bfb9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tag', sa.Column('status', sa.Boolean(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tag', 'status')
    # ### end Alembic commands ###
