"""empty message

Revision ID: a5f6e5ef172e
Revises: 42bd77b70eb3
Create Date: 2018-04-13 09:48:28.600219

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a5f6e5ef172e'
down_revision = '42bd77b70eb3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('tag', sa.Column('vulnerabilityCritical', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityDefcon1', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityHigh', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityLow', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityMedium', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityNegligible', sa.Integer(), nullable=True))
    op.add_column('tag', sa.Column('vulnerabilityUnknown', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('tag', 'vulnerabilityUnknown')
    op.drop_column('tag', 'vulnerabilityNegligible')
    op.drop_column('tag', 'vulnerabilityMedium')
    op.drop_column('tag', 'vulnerabilityLow')
    op.drop_column('tag', 'vulnerabilityHigh')
    op.drop_column('tag', 'vulnerabilityDefcon1')
    op.drop_column('tag', 'vulnerabilityCritical')
    # ### end Alembic commands ###
